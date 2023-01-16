import cv2 as cv
import numpy as np
import random

# draw contours OpenCV ready:
# def drawContours(img, contourList_contours, contourIdx: int = -1,
#	color = tuple, thickness: int = 1, lineType: int = 8)

def drawContours(img, contourList, index: int = -1, randColors: bool = False,
	color: tuple = (255, 0, 0), thickness: int = 1, lineType: int = 8):

	# Grayscale with RGB color get converted to color,
	# Grayscale with grayscale color, remain grayscale
	if img.ndim == 2 and len(color) > 1 and color[0] == color[1]  == color[2]:
		# if img.isGrayscale and (color.isRGB with R=G=B) aka color.isGrayscale
		color = color[0]	# keep it grayscale
	elif img.ndim == 2 and len(color) > 1:
		# elif img.isGrayscale and color.isRGB
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)	# make it colored image

	contourList = [np.array(c) for c in contourList] # convert each contour to np.array

	if randColors and index < 0:	# all indexes
		for i in range(len(contourList)):
			cv.drawContours(img, contours = contourList, contourIdx = i,
				color = random.choices(range(256), k=3),
				thickness = thickness, lineType = lineType)
	elif randColors: # only 1 index
		cv.drawContours(img, contours = contourList, contourIdx = index,
			color = random.choices(range(256), k=3),
			thickness = thickness, lineType = lineType)
	else:
		cv.drawContours(img, contours = contourList, contourIdx = index,
			color = color, thickness = thickness, lineType = lineType)

	return {'img': img}


def drawLines(img, lineList, randColors: bool = False, color: tuple = None,
	thickness: int = 1, lineType: int = 8):

	if img.ndim == 2 and len(color) > 1 and color[0] == color[1]  == color[2]:
		# if img.isGrayscale and color.isGrayscale
		color = color[0]	# keep it grayscale
	elif img.ndim == 2 and len(color) > 1:
		# elif img.isGrayscale and color.isRGB
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)	# make it colored image

	if randColors:
		for line in lineList:
			cv.line(img, pt1 = line[0], pt2 = line[1], #?? todo fix
				color = random.choices(range(256), k=3),
				thickness = thickness, lineType = lineType)
	else:
		for line in lineList:
			cv.line(img, pt1 = line[0], pt2 = line[1], #?? todo fix
				color = color, thickness = thickness, lineType = lineType)

	return {'img': img}


def drawCircles(img, circleList, randColors: bool = False, color: tuple = None,
	thickness: int = 1, lineType: int = 8):

	if img.ndim == 2 and len(color) > 1 and color[0] == color[1]  == color[2]:
		# if img.isGrayscale and color.isGrayscale
		color = color[0]	# keep it grayscale
	elif img.ndim == 2 and len(color) > 1:
		# elif img.isGrayscale and color.isRGB
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)	# make it colored image

	if randColors:
		for circle in circleList:
			cv.circle(img, center = circle[0:2], radius = circle[2],
				color = random.choices(range(256), k=3),
				thickness = thickness, lineType = lineType)
	else:
		for circle in circleList:
			cv.circle(img, center = circle[0:2], radius = circle[2],
				color = color, thickness = thickness, lineType = lineType)

	return {'img': img}

'''
def drawBBs(img, bbList, color: tuple = None,
	thickness: int = 1, lineType: int = 8):

	if img.ndim == 2 and len(color) > 1 and color[0] == color[1]  == color[2]:
		# if img.isGrayscale and color.isGrayscale
		color = color[0]	# keep it grayscale
	elif img.ndim == 2 and len(color) > 1:
		# elif img.isGrayscale and color.isRGB
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)	# make it colored image

	if randColors:
		for bb in bbList:
			cv.rectangle(img, pt1 = bb[0], pt2 = bb[1], #?? todo fix
				color = random.choices(range(256), k=3),
				thickness = thickness, lineType = lineType)
	else:
		for bb in bbList:
			cv.rectangle(img, pt1 = bb[0:2], pt2 = bb[2:4], #?? todo fix
				color = color, thickness = thickness, lineType = lineType)

	return {'img': img}'''


def drawBBs(img, boundingboxList: list, color: tuple, bbDims: tuple = None,
		thickness: int = 1, randColors: bool = False, lineType: int = 8):

	boundingboxList = np.array(boundingboxList)
	if (boundingboxList.ndim == 3) != (bbDims is None):
		# XOR. Iff bbDims given, we must only have a list of single points. Else points + dimemsions
		raise Exception('In drawBBs, you must not give the bounding box dimensions if and only if you give a list of points and dimensions.')

	if img.ndim == 2 and len(color) > 1 and color[0] == color[1]  == color[2]:
		# if img.isGrayscale and color.isGrayscale
		color = color[0]	# keep it grayscale
	elif img.ndim == 2 and len(color) > 1:
		# elif img.isGrayscale and color.isRGB
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)	# make it colored image
	
	if boundingboxList.ndim == 3:
		toplefts = boundingboxList[:,0,:]
		botRights= boundingboxList[:,0,:] + boundingboxList[:,1,:]
	elif boundingboxList.ndim == 2:
		topLefts = boundingboxList
		botRights= boundingboxList + bbDims
	else:
		raise Exception('In drawBBs, boundingboxList must be a list of points or of points and dimensions. Ie. must have ndim == 2 or 3')
	
	for (tl, br) in zip(topLefts, botRights):
		if randColors:
			color = random.choices(range(256), k=3)
		cv.rectangle(img, pt1=tl, pt2=br, color=color, thickness=thickness, lineType = lineType)

	return {'img': img}
