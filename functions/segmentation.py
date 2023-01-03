import numpy as np
import cv2 as cv
#import matplotlib.pyplot as plt
from skimage.filters import gaussian
from skimage import draw, img_as_float
from skimage.segmentation import active_contour, morphological_chan_vese

from .assertion import assertImg

#Using k means / color quantization
def colorQuant(img, k: int, initCentersFlag: int, eps: float = 1.0, maxIter: int = 10, attempts: int = 10):

	if img.ndim > 2:
		Z = img.reshape((-1,3))
	else:
		Z = img.flatten()
	Z = np.float32(Z)

	# define criteria, number of clusters(K) and apply kmeans()
	criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, maxIter, eps)
	ret, label, center = cv.kmeans(Z, k, None, criteria, attempts, initCentersFlag)
	#centers: kx3, the k colours
	#label: img.length x img.width, the pixel indexes

	# Now convert back into uint8, and make original image
	center_u8 = np.uint8(center)
	res = center_u8[label]

	res2 = res.reshape(img.shape)
	label = label.reshape(img.shape[0:2])

	return {"img": res2, "img_labels": label, "colors": center_u8.tolist()}
	#TODO just added the img, but what functionality we want? Should we keep
	#the label+center or the img


def _polygonPoints(corners: list, step: int):

	#np.append( corners, corners[0] ) #repeat the first point, to close the contour
	corners = np.vstack([*corners, corners[0]])
	# cv.drawContours does automatically close the contours.
	# But here we want to fill in all the points of the last segemt
	points = []

	for i in range(len(corners) - 1):
		segment = list( zip( *draw.line(*corners[i], *corners[i + 1])))
		points = [*points, *segment]

	points = np.array(points[::step])
	return points


def _changeXToY(points):
	#in format np.array([[a,b],[c,d],[e,f]])
	return points[:, ::-1]


#Active contour model
#User gives points, on js. We will monitor his clicks on the image.
#This is the contour.
def activeContourSegmentation(img, corners, alpha: float = 0.015, beta: float = 10,
		gamma: float = 0.001, linePointsStep: int = 9, gausSigma: float = 0):
	#TODO maybe add more params, or remove these ones, as they are optional
	#possible user inputs:
	#astronaut head
	#corners = [[50, 450], [50, 1160], [750, 1160], [700, 450]]
	#astronaut rocket
	#corners = [[0,1200], [0,1650], [1050,1650], [1050,1200]]
	#astronaut body
	#corners = [[670,320],[470,645],[530,1025],[905,1222],[1257,1257],[1438,1137],[1765,1120],[1765,54],[925,100]]

	assertImg(img, gray=True)

	if linePointsStep < 1 or not isinstance(linePointsStep, int):
		raise Exception('linePointsStep must be a positive integer')

	#user input in [[x1,y1],...,[xn,yn]], skimage needs (y,x)
	corners = _changeXToY(np.array(corners))
	contour = _polygonPoints(corners, step = linePointsStep)

	if gausSigma > 0:
		img = gaussian(img, gausSigma, preserve_range=False)

	snake = active_contour(img, contour, alpha, beta, gamma)

	snake = _changeXToY(snake)
	return {'contour': snake}


def chanVeseSegmentation(img, initLevelSetType: str, numIterations: int,
		smoothing: int = 3, l1: float = 1, l2: float = 1):
	# Smoothing: Reasonable values are around 1-4

	if initLevelSetType not in ['checkerboard', 'disk']:
		raise Exception('In chanVeseSegmentation, initLevelSetType must be checkerboard or disk')

	assertImg(img, gray=True)

	img = img_as_float(img)

	#levelSet is an image made up of 1s and 0s
	levelSet = morphological_chan_vese(img, num_iter = numIterations,
								init_level_set = initLevelSetType,
								smoothing = smoothing, lambda1 = l1, lambda2 = l2)

	return {'img_mask': 255*levelSet}
