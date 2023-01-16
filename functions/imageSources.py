import numpy as np
import cv2 as cv
from skimage import data


# Create image
def createSolidColor(x: int, y: int, color: list = [255,255,255], dtype:str='uint8'):
	''' The input color must be in BGR format (if we want the result to be in BGR) '''

	if np.ndim(color) == 0: # grayscale image
		return {'img': np.full((x, y), color, dtype=dtype)}
	else:
		if len(color) != 3:
			raise Warning('Are you sure? The given color doesnt have 3 components')

		color = list(color) # in case it was a tuple

		return {'img': np.full([x, y, 3], color, dtype=dtype)}


# Adds noise to image
def addNoise(img: np.ndarray, gen:str, mean: float = 0, scale: float = 1):

	noise = createRandom(gen, img.shape, mean=mean, scale=scale)['img']

	img = cv.add(img, noise, dtype=cv.CV_8U) # cv.add() does a clip() at the end
	# TODO verify dtype should be cv.CV_8U. Putting 256 was wrong, probably just worked because of bitmask (CV_8U was 0)

	return {'img': img}


'''
dim: image.shape . tuple (x,y,channels)
gen: 'uniform', 'normal', or 'poisson'
For normal, try scale 30-70 for an image in 0..255
For poisson, make sure that mean (=lambda) is > 0 '''
def createRandom(gen: str, dim: tuple, mean: float = 0, scale: float = 1):

	if np.ndim(mean) > 0 or np.ndim(scale) > 0:
		raise Exception('mean and scale must be scalars')

	if gen == 'uniform':
		img = (np.random.rand(*dim) - 0.5 + mean) * scale
	elif gen == 'normal':
		img = np.random.randn(*dim) * scale + mean
	elif gen == 'poisson':
		if mean <= 0:
			raise Exception('in poisson createRandom, mean must be > 0')
		img = np.random.poisson(lam=mean, size=dim)
	else:
		raise Exception('gen must be either uniform, normal, or poisson')

	return {'img': img}


# Get example image
def getImageFromExamples(name: str):

	# motorcycle returns 2 images, left and right
	if name.startswith("stereo_motorcycle"):
		name, side = name.split("#")
		side = int(side)

	imgFunc = getattr(data, name) #if not found, throws error
	img = imgFunc()

	if name == "stereo_motorcycle":
		img = img[side]

	# skimage returns the images in RGB format
	# convert to BGR, for consistency with opencv
	if img.ndim > 2:	#isNotGrayscale
		img = cv.cvtColor(img, cv.COLOR_RGB2BGR)

	elif img.dtype == bool or img.dtype == float: #isBoolean or isFloat, aka is in [0,1]
		img = img * 255.99
		img = img.astype(np.uint8)

	#rgba logo->not used, uint16 rgba lili->not used, float64 logan fantom

	return {'img': img}
