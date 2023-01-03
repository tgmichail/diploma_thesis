import numpy as np
import cv2 as cv
from enum import Enum

from . import imageSources
from .assertion import assertImg

from skimage.util import compare_images

# Image dimensions
def getImageDims(img):

	dims = img.shape[0:2]
	isGr = (img.ndim < 3 or img.shape[2] == 1)
	channels = 1 if isGr else img.shape[2]
	return {'isGrayscale': isGr, 'dimensions': dims, 'width': dims[1], 'height': dims[0],
			'channels': channels, 'numDims': img.ndim}

# Tune HSV
def tuneHSV(img: np.array, ch: str, multiply: float = 1, add: float = 0, modulo: bool = False):

	assertImg(img, has3Channels=True)
	hsvimg = cv.cvtColor(img, cv.COLOR_BGR2HSV)

	ch = ch.lower()
	maxVal = 180 if ch == 'h' else 256
	channels = {'h':0, 's':1, 'v':2}
	ch = channels[ch]

	tunedCh = hsvimg[:,:,ch].astype(np.int64) # this because below, when we do
	# tunedCh * multiply + add, numpy will automatically modulo to the dtype (256).
	# We also cannot eg. clip at every step, because clip(3*100) -> 255 , -20 -> 235, instead of 3*100-20=280 ->255
	tunedCh = tunedCh * multiply + add
	if modulo:
		tunedCh = np.mod(tunedCh, maxVal)
	else:
		tunedCh = tunedCh.clip(0, maxVal-1)

	hsvimg[:,:,ch] = tunedCh.astype(img.dtype)

	return {'img': cv.cvtColor(hsvimg, cv.COLOR_HSV2BGR)}

#Changing Colorspaces - OpenCV ready
#Geometric Transformations of Images - OpenCV ready
#Distance Transformation - OpenCV ready

# minMaxPoints
# Returns the positions of the global maximum/minimum, or those that are above a threshold
# todo think if you want to split it to 1)minMaxLoc, 2a)thresholding, 2b)binary-> positions of white points
def minMaxPoints(probMatr: np.ndarray, getMin: bool, multiPoints: bool, threshold: float):

	if not multiPoints:

		minVal, maxVal, minLoc, maxLoc = cv.minMaxLoc(probMatr)

		# If the method is TM_SQDIFF or TM_SQDIFF_NORMED, take minimum
		point = minLoc if getMin else maxLoc
		# it has normal ints. Not np.int. So it's fine for json. Also, it returns (x,y) correct order.

		points = [point]

	else: # multiPoints

		if getMin:
			loc = np.where(probMatr<= threshold)
		else:
			loc = np.where(probMatr>= threshold)

		#TODO verify that x is loc[1] and y is loc[0]
		points = zip(loc[1].tolist(), loc[0].tolist())	#top left x and y
		# We need to do .tolist(), to get ints and not np.ints. Because np.ints are not json serializable

		#zip creates a generator, and can only give the output one time
		#thus i need to save it
		points = list(points)

	return {'points': points}

#Image thresholding
tType = Enum('tType', ['simple_thresholding', 'adaptive_thresholding', 'otsu_s_thresholding'], start = 0);

def thresholding(img = None, probMatr = None, threshType: int = 0, threshSubtype: int = 0, adaptiveMethod: int = 0, thresh: float = 127 , maxVal: int = 255, blockSize = 11, C = 0):
	#maxval: maximum value to use with the THRESH_BINARY and THRESH_BINARY_INV thresholding types.
	# in simple thresh w/o otsu, it accepts mult channel, 8bit img (or float32 which we don't support generally)
	# on all else, it accepts only 8 bit, single channel img,
	#todo fix: add a probMatr, also change js. the other one make it null.

	if threshType == tType.simple_thresholding.value:
		if probMatr is not None:
			#assert is float? # TODO
			src = probMatr
		else:
			assertImg(img, uint8=True)
			src = img
	else:
		assertImg(img, uint8=True, gray=True)
		src = img


	if threshType == tType.simple_thresholding.value:
		retVal, threshImg = cv.threshold(src = src, thresh = thresh, maxval = maxVal, type = threshSubtype)

	elif threshType == tType.adaptive_thresholding.value:
		threshImg = cv.adaptiveThreshold(src = src, maxValue = maxVal, adaptiveMethod = adaptiveMethod, thresholdType = threshSubtype, blockSize = blockSize, C = C)

	elif threshType == tType.otsu_s_thresholding.value:
		retVal, threshImg = cv.threshold(src = src, thresh = 0, maxval = maxVal, type = (threshSubtype + cv.THRESH_OTSU))

	else:
		raise Exception("error: invalid thresholding type")

	return {'img': threshImg.astype(np.uint8)}

# Morphological Transformations
def morphTransform(img, kernelSize: int, kernelShape: int, transform: int, iterationNum: int = 1):
	#param: kernel size:int, kernel shape:rect, ellips, cross, which transform
	# iterationNum only applies in erosion and dilation. Default = 1
	# These can also work with non-binary grayscale images, and colored images

	kernel = cv.getStructuringElement(kernelShape,(kernelSize,kernelSize))

	if transform == cv.MORPH_ERODE :
		result = cv.erode(img, kernel, iterations = iterationNum)
	elif transform == cv.MORPH_DILATE :
		result = cv.dilate(img, kernel, iterations = iterationNum)
	else:
		result = cv.morphologyEx(img, transform, kernel, iterations = iterationNum)

	return {'img': result}


# Drawing Functions
#TODO check if coords are inside the img boundaries, add default values
# drawLine, drawRect, drawCirc, drawEllip, drawPolyline, drawText - OpenCV ready

def drawRect(img: np.ndarray, rect: list, color: list = (255,0,0),
		thickness: int = 1, filled: bool = False) -> dict:
	''' rect can be either [[x1,y1],[x2,y2]] or a contour of 4 points (if a rotated rectangle) '''
	if filled:
		thickness = -1

	if len(rect) == 2:
		cv.rectangle(img, rect, color=color, thickness=thickness)
	elif len(rect) == 4:
		cv.drawContours(img, [rect], 0, color=color, thickness=thickness)
	else:
		raise Exception('rect must be a list of 2 or 4 points')

	return {'img': img}


#Split Image - OpenCV ready
#Merge Image - OpenCV ready, but will implement too, because we need inputs as
# img1, img2, img3 and not array[imgs]
def merge(img_0, img_1, img_2):

	assertImg(img_0, img_1, gray=True, sameDimensions=True)
	assertImg(img_2, img_1, gray=True, sameDimensions=True)

	imgs = [img_0, img_1, img_2]
	result = cv.merge(imgs)
	return {'img': result}

#Image Borders - OpenCV ready
#Image Adding and Blending - OpenCV ready
#def split(img_m)
#def merge(img_mv)
#def add(img_src1, img_src2)
#def addWeighted(img_src1, alpha: int = 0.5, img_src2, beta: int = 0.5, gamma: int = 0)
#def subtract(img_src1, img_src2)

def compare(img_1, img_2, method: str = "diff", tileSize: tuple = (8,8)):
#todo add assertion
	assertImg(img_1, img_2, gray=True, sameDimensions=True)

	if method == "checkerboard":
		probMatr = compare_images(img_1, img_2, method = method, n_tiles = tileSize)
	else:
		probMatr = compare_images(img_1, img_2, method = method)

	# returns float64, we convert to uint8
	img = np.uint8(probMatr * 256)
	return {'img': img}

def multiply(img_1, scale: float = 1, img_2 = None, probMatr = None):

	if probMatr is not None:  #probMatr x image
		print(probMatr)
		assertImg(probMatr, img_1, sameDimensions=True)
		# TODO 3plasiase ta dims, epeidh alliws petaei sfalma.
		res = cv.multiply(probMatr, img_1, scale = scale, dtype = cv.CV_8U)
	elif img_2 is not None:  #image x image
		assertImg(img_1, img_2, sameDimensions=True, sameChannelsNum=True)
		res = cv.multiply(img_1, img_2, scale = scale, dtype = cv.CV_8U)
	else:   #scalar x image
		res = cv.multiply(scale, img_1, dtype = cv.CV_8U)

	# TODO ? doesnt include scalar x probMatr
	return {'img': res}

#def resize(img_src, dsize_cols: int = 0, dsize_rows: int = 0, fx: float = 0, fy: float = 0) #dsize or (fx and fy) must be non-zero

def affineTransform(img, translationPercentX:float = 0, translationPercentY:float = 0,
	rotCenterPercentX: float = 0.5, rotCenterPercentY: float = 0.5,
	rotAngle: int = 0, scale: int = 1):

	(h, w) = img.shape[0:2]

	#translation
	Mt = np.float32([[ 1, 0, w*translationPercentX],[ 0, 1, h*translationPercentY]])
	#scaling
	# Ms = np.float32([[ np.sqrt(scale), 0, 0],[ 0, np.sqrt(scale), 0]])
	#rotation
	Mr = cv.getRotationMatrix2D( ((w-1)*rotCenterPercentX,(h-1)*rotCenterPercentY), rotAngle, 1)

	M = Mr

	img = cv.warpAffine(src = img, M = M, dsize = (scale*w, scale*h))

	#TODO ayto to pragma kai oles oi alles epishs prepei na einai uint8. twra den exw idea ti einai
	return {'img': img}

# Combine imgs on mask
def combineImages(img_0: np.ndarray, img_1: np.ndarray, img_mask: np.ndarray):
	''' Combines 2 images using a mask.
	Output pixels are from img_0 where mask==0 and from img_1 elsewhere. '''

	assertImg(img_0, img_1, sameDimensions=True)
	assertImg(img_mask, uint8=True, gray=True)
	#todo does it need mask to be the same dims?

	img_0 = cv.bitwise_and(img_0, img_0, mask = cv.bitwise_not(img_mask))
	img_1 = cv.bitwise_and(img_1, img_1, mask = img_mask)
	result = cv.add(img_0, img_1)

	return {'img': result}

#todo make them constinent
#-here: checkbox, to choose percent/absolute
#-cv.resize: exei kai ta dyo, kai an afhseis to ena me 0, dra san to createSolidColor
#-affine: mono percentage gia ta shmeia
# helper
def prepareImgForOverlay(img: np.ndarray, dest_shape: tuple,
		left:float=0, top:float=0, offsetsPercent: bool=False):

	dest_width = dest_shape[1]
	dest_height= dest_shape[0]

	if offsetsPercent:
		left = dest_width * left/100
		top = dest_height * top/100

	left = round(left)
	top  = round(top)
	right= dest_width - left - img.shape[1]
	bot  = dest_height - top - img.shape[0]

	return addOffsetOrCrop(img, left, right, top, bot) # it is already a dict


# helper
def addOffsetOrCrop(img: np.ndarray, left:int=0, right:int=0, top:int=0, bot:int=0, bgColor=0):
	''' If left, right, top, or bot, are > 0, this offset is added to that side.
	If they are <0, the image is cropped that much at that side. '''

	if not isinstance(left+right+top+bot, int):
		raise TypeError('At addMarginOrCrop, offsets must be integers')

	orig_shape = img.shape
	dest_shape = list(orig_shape) # So we can edit it below
	dest_shape[1] += left + right
	dest_shape[0] += top + bot

	if dest_shape[0] <= 0 or dest_shape[1] <= 0: # check if the dims are >0
		raise Exception('At addMarginOrCrop, the resulting image\'s dimensions must be positive')

	if bgColor == 0 and img.ndim > 2:
		bgColor = np.zeros(img.shape[2], dtype='uint8')

	# result = np.zeros(dest_shape, dtype='uint8')
	result = imageSources.createSolidColor(dest_shape[0], dest_shape[1], bgColor)['img']

	#The offsets for original and destination images
	ofst_orig = np.array([-left, right, -top, bot])
	ofst_dest = -ofst_orig

	ofst_orig += [0, orig_shape[1], 0, orig_shape[0]]
	ofst_dest += [0, dest_shape[1], 0, dest_shape[0]]

	# clip to dimensions of the original image and the destination image
	ofst_orig = ofst_orig.clip(0, [orig_shape[1], orig_shape[1], orig_shape[0], orig_shape[0]])
	ofst_dest = ofst_dest.clip(0, [dest_shape[1], dest_shape[1], dest_shape[0], dest_shape[0]])

	result[ofst_dest[2]:ofst_dest[3], ofst_dest[0]:ofst_dest[1]] = \
	   img[ofst_orig[2]:ofst_orig[3], ofst_orig[0]:ofst_orig[1]]

	return {'img': result}
