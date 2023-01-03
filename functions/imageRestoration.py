import cv2 as cv
from .assertion import assertImg
# Noise Removal (ComputationalPhotography)

#Image Denoising with non local means
#cv.fastNlMeansDenoising() and
#cv.fastNlMeansDenoisingColored - OpenCV ready
#but we merge them in one here

def fastNlMeansDenoising(img, h: float = 3,
	hColor: float = 3, templateWindowSize: int = 7, searchWindowSize: int = 21):

	if img.ndim == 2: # isGrayscale
		assertImg(img, gray = True, uint8 = True)
		outp = cv.fastNlMeansDenoising(img, h=h, templateWindowSize = templateWindowSize,
			searchWindowSize = searchWindowSize)
	else:
		assertImg(img, has3Channels = True, uint8 = True)
		outp = cv.fastNlMeansDenoisingColored(img, h = h, hColor = hColor,
			templateWindowSize = templateWindowSize,
			searchWindowSize = searchWindowSize)

	return {'img': outp}

#Image Inpainting - OpenCV ready
