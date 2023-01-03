import numpy as np
import cv2 as cv
from matplotlib import pyplot as plt

from .assertion import assertImg

def depthMap(img_L, img_R, numDisparities: int = 16, blockSize: int = 15):

	assertImg(img_L, img_R, gray=True, sameDimensions=True)

	stereo = cv.StereoBM_create(numDisparities = numDisparities, blockSize = blockSize)
	disparity = stereo.compute(img_L, img_R)

	# disparity is int16 with minimum -16 -> uint8, saturated
	disparity = disparity + 16
	disparity = disparity / disparity.max() * 255
	disparity = disparity.astype(np.uint8)

	print(disparity.min(), disparity.max())

	return {'img': disparity}
