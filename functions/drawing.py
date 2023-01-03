#draw contour, circle, line, bounding box

def drawContours(img, contourList_contours: contourList, contourIdx: int = -1, color = tuple, thickness: int = 1, lineType: int = 8): -> image
#cv::LineTypes {cv::FILLED = -1,cv::LINE_4 = 4,cv::LINE_8 = 8,cv::LINE_AA = 16}


#make them accept circleList, and have a checkbox for random colors.
def circle(img, center: tuple, radius: int, color: tuple, thickness:int = 1, lineType: int = 8) -> 	img

#also lineList
def line(img, pt1_x: int, pt1_y: int, pt2_x: int, pt2_y: int, color: tuple, thickness: int = 1, lineType: int = 8) -> 	img

#also many point sets
def rectangle(img, pt1_x: int, pt1_y: int, pt2_x: int, pt2_y: int, color: tuple, thickness: int = 1, lineType: int = 8) -> img

def drawBBsFromPoints(img, points: list, bbDims: tuple, color: tuple, thickness: int = 1):

	numChannels = img.shape[2] if img.ndim == 3 else 1
	if len(color) != numChannels:
		raise Exception('In drawBBsFromPoints, img and color have different number of channels')

	for point in np.array(points):
		cv.rectangle(img, pt1=point, pt2=(point + bbDims), color=color, thickness=thickness)

	return {'img': img}
