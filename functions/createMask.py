import numpy as np
import cv2 as cv
from skimage.filters import window

# From default window types
def createWindow(windowType: str = "boxcar", w: int = 100, h: int = 100):
# Window types: - boxcar - triang - blackman - hamming - hann - bartlett -
# flattop - parzen - bohman - blackmanharris - nuttall - barthann -
# kaiser (needs beta) - gaussian (needs standard deviation) -
# general_gaussian (needs power, width) - slepian (needs width) -
# dpss (needs normalized half-bandwidth) - chebwin (needs attenuation) -
# exponential (needs decay scale) - tukey (needs taper fraction)

# certain window types require parameters that have to be supplied with the
# window name as a tuple (e.g., ("tukey", 0.8))

#TODO in case of color image, how we want it to behave?

	# skimage accepts only tuples, and we give array from html
	if isinstance(windowType, list):
		windowType = tuple(windowType)

	win = window(window_type = windowType, shape = (w,h))
	# TODO it might need 3 channels if it is color
	#TODO returns: A window of the specified shape. dtype is np.double.
	return {'probMatr': win}


# Create mask/window from a given contour, on the size of img_ref
def createMaskFromContour(img_ref, contour):

	# todo do we need this here?
	contour = np.array(contour)
	mask = np.zeros(img_ref.shape[0:2], np.uint8)
	cv.drawContours(mask, [contour], 0, 255, -1)
	return {'img': mask}
