# Shape / Object? detection
import numpy as np
import cv2 as cv

from .assertion import assertImg


# Hough line detection
# helper function
def _convertRhoTheta2Points(r: float, th: float, xmax: int, ymax: int) -> list:
	'''returns ((x1,y1),(x2,y2)) '''
	points = []

	'''
	y = r/np.sin(th) - x/np.tan(th)
	x = r/np.cos(th) - y*np.tan(th)
	Put all cases in try-catch because some divisions may lead to inf'''

	# try x=0
	try:
		y1 = int(round(r/np.sin(th))) # - 0
		if y1 >= 0 and y1 <= ymax:
			points.append((0, y1))
	except OverflowError: # because may divide by zero and become infinity
		print('Caught div by 0 while looking for border points of line at _convertRhoTheta2Points')

	# try y=0
	try:
		x1 = int(round(r/np.cos(th))) # - 0
		if x1 >= 0 and x1 <= xmax:
			points.append((x1, 0))
		if len(points) == 2:
			return tuple(points)
	except OverflowError:
		print('Caught div by 0 while looking for border points of line at _convertRhoTheta2Points')

	# try x=xmax
	try:
		y1 = int(round(r/np.sin(th) - xmax/np.tan(th)))
		if y1 >= 0 and y1 <= ymax:
			points.append((xmax, y1))
		if len(points) == 2:
			return tuple(points)
	except (OverflowError,ValueError):
		print('Caught div by 0 while looking for border points of line at _convertRhoTheta2Points')

	#try y=ymax
	try:
		x1 = int(round(r/np.cos(th) - ymax*np.tan(th)))
		if x1 >= 0 and x1 <= xmax:
			points.append((x1, ymax))
	except (OverflowError,ValueError):
		print('Caught div by 0 while looking for border points of line at _convertRhoTheta2Points')

	if len(points) != 2:
		raise Exception('_convertRhoTheta2Points could not find 2 points')

	return tuple(points)


def HoughLines(img: np.ndarray, threshold : int, rho: float = 1, theta: float = np.pi / 180,
		probabilistic: bool = False, minLineLength: float = 0, maxLineGap: float = 0) -> list:
	''' Returns list of line segments, same format as featureMatching, ie.
	result = [ ((x1,y1),(x2,y2)) , ((x1,y1),(x2,y2)) ...]
	'''

	assertImg(img, gray=True, binary=True)

	if probabilistic:
		lineList = cv.HoughLinesP(img, rho=rho, theta=theta, threshold=threshold,
				minLineLength=minLineLength, maxLineGap=maxLineGap)

		if lineList is None:
			return {'lineList': []}

		result = [(pts[0][0:2],pts[0][2:4]) for pts in lineList]
		# lineList == [ [(x1,y1,x2,y2)] , [(x1,y1,x2,y2)] , ... ]
		# we now return same format as featureMatching, ie.
		# result = [ ((x1,y1),(x2,y2)) , ((x1,y1),(x2,y2)) ...]

	else: # not probabilistic
		lineList = cv.HoughLines(img, rho=rho, theta=theta, threshold=threshold)

		if lineList is None:
			return {'lineList': []}

		ymax,xmax = img.shape

		# lineList is [ [[rho,theta]], [[rho,theta]] ,...]
		# We convert it to the points at the edges of the image, ie. with x=0 or xmax or y=0 or ymax
		result = [ _convertRhoTheta2Points(line[0][0], line[0][1], xmax, ymax) for line in lineList ]
	return {'lineList': result}


# Hough circle detection
# HoughCircles() - opencv ready
# cv.HoughCircles(img, method, dp, minDist[, circles[, param1[, param2[,
#					minRadius[, maxRadius]]]]] ) -> circles
# Takes a grayscale image as input. Better to apply Gaussian blur before.
def HoughCircles(img, method: int = 3, dp: float = 1.5, minDist: float = 5,
	param1: float = 100, param2: float = 100, minRadius: int = 1, maxRadius: int = -1):

	assertImg(img, gray=True)

	circles = cv.HoughCircles(img, method, dp, minDist, param1 = param1,
		param2 = param2, minRadius = minRadius, maxRadius = maxRadius)

	if circles is None:
		return {'circleList': []}

	# make the output serializable. And convert float to int
	circles = circles[0].round().astype('uint32').tolist() # we get circles[0] because it has a useless extra [ ] outside
	return {'circleList': circles}

# Template Matching - also cvready TODO na thn krathsw h oxi?
#vlepe arxeio template matching
def templMatching(img, img_template, method: int):
	#methods = ['cv.TM_CCOEFF', 'cv.TM_CCOEFF_NORMED', 'cv.TM_CCORR',
	#			'cv.TM_CCORR_NORMED', 'cv.TM_SQDIFF', 'cv.TM_SQDIFF_NORMED']

	# tm only takes uint8 (and float32 but we don't support that)
	# todo check dimensions of template < imgs
	assertImg(img, uint8=True)

	# Apply template Matching
	res = cv.matchTemplate(img, img_template, method)

	if method in [cv.TM_CCOEFF_NORMED, cv.TM_CCORR_NORMED, cv.TM_SQDIFF_NORMED]:
		return {'probMatr': res}
	else:
		return {'floatMatr': res}
	# This function could also be openCV ready, just done in JS.
	# We would have to set returnType to either probMatr or floatMatr


# Histogram Backprojection
#Histogram Backprojection, with optional convolution on the result, for better result
#can be followed by thresholding of the result, and bitwise_and with the init img
def backprojection(img_target, img_roi, convElemSize: int):

	assertImg(img_target, img_roi, has3Channels=True, uint8=True)

	hsv = cv.cvtColor(img_roi, cv.COLOR_BGR2HSV)
	hsvt = cv.cvtColor(img_target, cv.COLOR_BGR2HSV)

	# calculating object histogram
	roihist = cv.calcHist([hsv],[0, 1], None, [180, 256], [0, 180, 0, 256] )

	# normalize histogram and apply backprojection
	cv.normalize(roihist, roihist, 0, 255, cv.NORM_MINMAX)
	dst = cv.calcBackProject([hsvt], [0,1], roihist,[0,180,0,256],1)

	# Now convolute with circular disc
	if convElemSize > 1:
		disc = cv.getStructuringElement(cv.MORPH_ELLIPSE, (convElemSize,convElemSize))
		cv.filter2D(dst, -1, disc, dst)

	#TODO add this as a next box in the pipeline
	# threshold and binary AND
	#ret,thresh = cv.threshold(dst,50,255,0)
	#thresh = cv.merge((thresh,thresh,thresh))
	#res = cv.bitwise_and(img_target,thresh)
	return {'img': dst}

	#to show
	#plt.imshow(dst, cmap = "gray")
	#plt.show()

	#res = np.vstack((img_target,thresh,res))
	#cv.imwrite('res.jpg',res)
