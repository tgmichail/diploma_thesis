import numpy as np
import cv2 as cv

from .assertion import assertImg

# Find Contours
# Epistrefei tuple (contours, hierarchy) alla theloume na krathsoume mono ta contours.
#TODO check the assertion for 8-bit single-channel image. Non-zero pixels are treated as 1's. Zero pixels remain 0's, so the image is treated as binary
def findContours(img: np.ndarray, method: int = cv.RETR_LIST, mode: int = cv.CHAIN_APPROX_SIMPLE) -> list:

	assertImg(img, gray=True, binary=True, uint8=True)

	contours, hierarchy = cv.findContours(image=img, method=method, mode=mode)

	contours = [c.reshape([-1,2]).tolist() for c in contours]
	# cv.findContours returns a py tuple of nparrays of shape (points,1,2).
	# Eg. [ [[pointx, pointy]], [[x,y]], [[x,y]] ]
	# We get rid of the useless dimension, and convert tolist() to be able to JSON.dumps()

	return {'contourList': contours}


# Get contour properties
def contourProperties(contour, prop: str = 'all', img_ref: np.ndarray = None) -> dict:
	#todo assert only one contour is given. Does it also work for multiple contours?
	M = cv.moments(contour)
	x,y,w,h = cv.boundingRect(contour)
	hull_area = cv.contourArea(cv.convexHull(contour))

	# make the mask. Reference image must be given
	if img_ref is not None:
		mask = np.zeros(img_ref.shape[0:2], np.uint8)
		cv.drawContours(mask,[contour],0,255,-1)
		#pixelpoints = cv.findNonZero(mask)

	props = {
		'area' : M['m00'],
		'perim' : cv.arcLength(contour,True),
		'centerx' : M['m10']/M['m00'],
		'centery' : M['m01']/M['m00'],
		'is_convex' : cv.isContourConvex(contour),
		'aspect_ratio' : float(w)/h,
		'extent' : float(M['m00']) / (w*h), # area/rect_area
		'solidity' : float(M['m00'])/hull_area,
		'equiv_diameter' : np.sqrt(4*M['m00']/np.pi),
		'orientation' : cv.fitEllipse(contour)[-1] # is it in degrees or rad?
	}

	if img_ref is not None:
		imgChannels = img_ref.shape[2] if img_ref.ndim == 3 else 1
		props['mean_val'] = cv.mean(img_ref, mask = mask)[0:imgChannels] # cv.mean() always returns a tuple of 4 values
		props['min_val'], props['max_val'], props['min_loc'], props['max_loc'] = cv.minMaxLoc(img_ref, mask = mask)

	if prop == 'all':
		return props
	elif prop == 'center':
		return {'center': (props['centerx'], props['centery'])}
	else:
		try:
			return {prop: props[prop]}
		except KeyError:
			raise KeyError('Cannot find contour property {}. Maybe provide a reference image?'.format(prop))


# Contour filtering based on criteria
# TODO add cv.isContourConvex(cnt)
def contourFilter(contourList: list, criteria: list) -> list:
	''' Argument criteria is a list of criteria dicts: {'attr': area/perim/centerx/centery ,
			'type': top_k/bot_k/percentile/abs, 'thresh': (top)_k/p%/float, 'compare': <= / >= } '''

	n = len(contourList)
	contours = np.array(contourList, dtype=object)
	# Make an np array of py lists, because they have different lengths. It's ok, we still
	# want to have a numpy array, to do "contours[props[attr] < thresh] = None"
	props = {
		'area' : np.zeros(n),
		'perim' : np.zeros(n),
		'centerx' : np.zeros(n),
		'centery' : np.zeros(n)
	}

	for i in range(n):
		c = np.array(contours[i], dtype=int) # here we must specify dtype=int because if all contours have the
		# same length, c will be already a np.array of dtype=object. (otherwise it will be a python list)
		contours[i] = c

		M = cv.moments(c)
		props['area'][i] = M['m00']
		props['centerx'][i] = M['m10']/M['m00']
		props['centery'][i] = M['m01']/M['m00']
		props['perim'][i] = cv.arcLength(c,True)

	for crit in criteria:
		if crit['thresh'] < 0:
			raise Exception('Thresholds of contourFilter must be positive')

		attr = crit['attr']

		if crit['type'] == 'top_k' or crit['type'] == 'bot_k':
			sort_attr = sorted(props[attr], reverse=True)
			index = crit['thresh']-1 if crit['type'] == 'top_k' else -crit['thresh'] # top 1 -> a[0]. Bottom 1 -> a[-1]
			thresh = sort_attr[index]

		elif crit['type'] == 'percentile':
			thresh = np.percentile(props[attr], 100-crit['thresh'])
			# >= top 5% = bigger than 95%

		else: # absolute threshold given
			thresh = crit['thresh']

		# Do the filtering
		if crit['compare'] == '>=':
			contours[props[attr] < thresh] = None
		elif crit['compare'] == '<=':
			contours[props[attr] > thresh] = None
		else:
			raise Exception("crit['compare'] can only be >= or <=")

	contours = [x.tolist() for x in contours if x is not None]
	# the not-None contours. The ones that pass all the criteria
	return {'contourList': contours}


# Contour/curve approximation as polygon cv.approxPolyDP() - OpenCV ready
# Similarity of two contours cv.matchShapes - OpenCV ready


# Bounding Box / Bounding circle / Bounding shape
#given a point set (eg contour) or gray-scale image
# TODO what is point? FIX. we mean contour?
def boundingShape(contour, shape: str):
	#rectangle accepts contour or grayscale or binary img
	#the others want a 2d point set
	if shape == "Rectangle":
		x, y, w, h = cv.boundingRect(contour) #x,y,w,h
		bbpoints = [[x, y], [w, h]]
		return {'boundingbox': bbpoints}
		#todo 2 2d points, mhpws thelw 4? gia ta draw

	elif shape == "MinAreaRectangle":
		rect = cv.minAreaRect(contour)
		box = cv.boxPoints(rect)
		return {'contour': np.int0(box)} #4 2D points

	elif shape == "Circle":
		(x, y), radius = cv.minEnclosingCircle(contour) #x, y, radius
		return {'circle': {'center': (round(x), round(y)), 'radius': round(radius, 3)}}

	elif shape == "Triangle":
		retval, contour = cv.minEnclosingTriangle(contour) #retval?, 3 2D points
		contour = contour.round().astype(int)
		return {'contour': contour}

	#elif shape == "Ellipse": #ellipse not exactly outscribed. It is fitted
	#	return cv.fitEllipse(points)	#outscribed rotated rectangle - drawEllipse accepts it as an argument

#TODO minAreaRect and fitEllipse, possibly others too, might return points
#outside of the image boundaries
