import cv2 as cv
import numpy as np
import random

# draw contours OpenCV ready:
# def drawContours(img, contourList_contours, contourIdx: int = -1,
#	color = tuple, thickness: int = 1, lineType: int = 8)

def drawContours(img, contourList, index: int = -1,
	randColors: bool = False, color: tuple = (255, 0, 0), thickness: int = 1, lineType: int = 8):

	if not randColors and img.ndim == 2 and len(color) > 1 and color[0] == color[1] and color[1] == color[2]:
		# all colors are the same and grayscale image -> keep it grayscale
		color = color[0]
	elif img.ndim == 2 and len(color) > 1:
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR) # make it colored image
	
	if randColors and index < 0:
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

	if not randColors and img.ndim == 2 and len(color) > 1 and color[0] == color[1] and color[1] == color[2]:
		# all colors are the same and grayscale image -> keep it grayscale
		color = color[0]
	elif img.ndim == 2 and (randColors or len(color) > 1):
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR) # make it colored image
	
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

	if not randColors and img.ndim == 2 and len(color) > 1 and color[0] == color[1] and color[1] == color[2]:
		# all colors are the same and grayscale image -> keep it grayscale
		color = color[0]
	elif img.ndim == 2 and (randColors or len(color) > 1):
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR) # make it colored image
	
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


def drawBBs(img, bbList, randColors: bool = False, color: tuple = None,
	thickness: int = 1, lineType: int = 8):

	if not randColors and img.ndim == 2 and len(color) > 1 and color[0] == color[1] and color[1] == color[2]:
		# all colors are the same and grayscale image -> keep it grayscale
		color = color[0]
	elif img.ndim == 2 and (randColors or len(color) > 1):
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR) # make it colored image
	
	if randColors:
		for bb in bbList:
			cv.rectangle(img, pt1 = bb[0], pt2 = bb[1], #?? todo fix
				color = random.choices(range(256), k=3),
				thickness = thickness, lineType = lineType)
	else:
		for bb in bbList:
			cv.rectangle(img, pt1 = bb[0:2], pt2 = bb[2:4], #?? todo fix
				color = color, thickness = thickness, lineType = lineType)

	return {'img': img}


def drawBBsFromPoints(img, points: list, bbDims: tuple, color: tuple, thickness: int = 1):

	if img.ndim == 2 and len(color) > 1 and color[0] == color[1] and color[1] == color[2]:
		# all colors are the same and grayscale image -> keep it grayscale
		color = color[0]
	elif img.ndim == 2 and len(color) > 1:
		img = cv.cvtColor(img, cv.COLOR_GRAY2BGR) # make it colored image
	
	for point in np.array(points):
		cv.rectangle(img, pt1=point, pt2=(point + bbDims), color=color, thickness=thickness)

	return {'img': img}
