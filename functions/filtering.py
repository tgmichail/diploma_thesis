import numpy as np
import cv2 as cv
from skimage.filters import unsharp_mask

#Smoothing images/ Low Pass Filtering - OpenCV ready
#def blur(img_src, ksizex:int = 5, ksizey:int = 5) -> 	dst
#def GaussianBlur(img_src, ksizex:int = 5, ksizey:int = 5) -> 	dst
#ksize positive and odd 3,5,7
#	cv.GaussianBlur(	src, ksize, sigmaX=0)
#sigmaX = 0
#def medianBlur(img_src, ksize: int = 5	) -> 	dst
#def bilateralFilter(img_src, d: int = 5 , sigmaColor: int = 50, sigmaSpace: int = 50) -> 	dst
#sigma > 5, d filter size < 10
#def filter2D(img_src, ddepth: int = -1, img_kernel) -> 	dst
#need a funct that creates a kernel, maybe

#Image gradients / High Pass Filtering
def gradient(img, filterType: str = "Laplacian", dx: int = 1, dy: int = 1,
		ksize: int = 3, returnFloats: bool = False):
	#param: filterType: Sobel, Scharr and Laplacian
	#default values, see documentation
	#ksize must be positive and odd: must be exactly 1,3,5,7

	if filterType == "Laplacian":
		imgx64F = cv.Laplacian(img, cv.CV_64F, ksize = ksize)
	elif filterType == "Sobel":
		imgx64F = cv.Sobel(img, cv.CV_64F, dx, dy, ksize = ksize)
	elif filterType == "Scharr":
		imgx64F = cv.Scharr(img, cv.CV_64F, dx, dy) # den exei ksize
	else:
		raise Exception('In gradient, filter type is not supported')
	
	if returnFloats:
		return {'floatMatr': imgx64F}

	abs_img64f = np.absolute(imgx64F)
	img_8u = np.uint8(abs_img64f)

	return {'img': img_8u}

#More filtering
#Unsharp masking
def unsharpMask(img, radius: float = 1, amount: float = 1):
	isGray = (img.ndim == 2)
	unsharp_img = unsharp_mask(image = img, radius=radius, amount=amount, preserve_range=True, channel_axis=(None if isGray else 2))

	return {'img': unsharp_img}

#Edge detection
#Canny ED - OpenCV ready
#def Canny(img_image, threshold1: int = 100, threshold2: int = 200, apertureSize: int = 3, L2gradient: bool = false) -> 	edges
# 0 512 thresh diasthma
# sobel kernel 1,3,5,7
