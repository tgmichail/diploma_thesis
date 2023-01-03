import io
import cv2 as cv
import numpy as np
from enum import Enum
from matplotlib import pyplot as plt
from skimage.exposure import match_histograms

from .assertion import assertImg

# Calculate Histogram
def calcHist(img, numBins: int = 256, img_mask = None, channel: int = 0):

	assertImg(img, img_mask, uint8=True, sameDimensions=(img_mask is not None))

	if numBins > 256: #color depth
		raise Exception("bins can't be more than the img color depth")


	if img.ndim == 2: # if is grayscale
		hist = cv.calcHist([img], [0], img_mask, [numBins], [0, 256])
	else:
		hist = cv.calcHist([img], [channel], img_mask, [numBins], [0, 256])

	return {'hist': hist.tolist()}


# Plot Histogram
def plotHist(img, perChannel: bool = False, logy: bool = True):
#grayscale/color, if color perChannel/total

	assertImg(img, uint8=True)

	if img.ndim == 3:  # color
		if perChannel:
			color = ('b','g','r')
		else:
			img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
			color = ('k')

	elif img.ndim == 2: # grayscale
		color = ('k')

	else:
		raise Exception('In plotHist, image must have 2 or 3 dimensions')

	for i,col in enumerate(color):
		histr = cv.calcHist([img],[i],None,[256],[0,256])
		plt.plot(histr,color = col)

	plt.xlim([0,256])
	if logy:
		plt.yscale('log')

	with io.BytesIO() as buf:
		# save plt figure in a buffer
		plt.savefig(buf, format='png')
		buf.seek(0)

		# read buffer as opencv image
		nparr = np.frombuffer(buf.read(), np.uint8)
		histImg = cv.imdecode(nparr, cv.IMREAD_UNCHANGED)

	plt.clf()
	plt.cla()
	return {'img': histImg}

# Equalize Histogram

histEqType = Enum('histEqType', ['basic', 'adaptive'], start = 0)

def histEqualization(img, equalType: int, clipLimit: float = 40, tileGridSizeX: int = 8, tileGridSizeY: int = 8): #how to deal with the different arguments?

	assertImg(img, gray=True)

	if equalType == 0:
		equ = cv.equalizeHist(img)
	elif equalType == 1:
		clahe = cv.createCLAHE(clipLimit=clipLimit, tileGridSize=(tileGridSizeX, tileGridSizeY))
		equ = clahe.apply(img)

	return {'img': equ}


# Match Histograms
def matchHist(img, img_ref):
	assertImg(img, img_ref, sameChannelsNum=True)

	if img.ndim < 3: #is grayscale
		matched = match_histograms(image = img, reference = img_ref, channel_axis = None)
	else:	#is color
		matched = match_histograms(image = img, reference = img_ref, channel_axis = -1)

	return {'img': matched}


# Calculate 2D Histogram
#h eikona tha einai apo prin h se HSV h se BGR
#o xrhsths tha epilegei poia dyo kanalia na kanei histogram
def calc2DHist(img, colSpaceType: str, ch1: int, ch2: int):

	assertImg(img, has3Channels=True, uint8=True)

	if colSpaceType == "HSV":
		histSize1 = 180  if (ch1 == 0) else 256
		#max Hue is 180, max Sat and Val is 256
		histSize2 = 180  if (ch2 == 0) else 256
	elif colSpaceType == "BGR":
		histSize1 = 256
		histSize2 = 256
	else:
		raise Exception('At calc2DHist, colSpaceType must be BGR or HSV')

	hist = cv.calcHist( [img], [ch1, ch2], None, [histSize1, histSize2], [0, histSize1, 0, histSize2] )
	return {'floatMatr_hist': hist}

# Plot 2D Histogram
#from calcul2DHist we get a viewable 2d array, but without axes
#plot could add the axes and color on the pixels, but maybe there is no need for that
