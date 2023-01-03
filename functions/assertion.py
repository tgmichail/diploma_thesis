import numpy as np
import sys

# must be gray, uint8, same dimensions
def assertImg(img, img2 = None, gray = False, binary = False, uint8 = False,
	sameDimensions = False, has3Channels = False, sameChannelsNum = False):

	callerFunc = sys._getframe().f_back.f_code.co_name

	if img is None:
		raise Exception(f"No image given in function {callerFunc}.")
		
	img2nn = img2 is not None

	if gray or binary:
		if img.ndim > 2 or (img2nn and img2.ndim > 2):
			raise Exception(f"Image given in function {callerFunc} is not grayscale.")

	if binary:
		if len(np.unique(img)) > 2 or (img2nn and len(np.unique(img2))):
			raise Exception(f"Image given in function {callerFunc} is not binary.")

	if uint8:
		if img.dtype != np.uint8 or (img2nn and img2.dtype != np.uint8):
			raise Exception(f"Image given in function {callerFunc} is not uint8.")

	if sameDimensions:	# width and height
		if img.shape[0:2] != img2.shape[0:2]:
			raise Exception(f"Images given in function {callerFunc} don't have the same dimensions.")

	if has3Channels:
		if img.ndim != 3 or img.shape[2] != 3 or (img2nn and (img2.ndim != 3 or img2.shape[2] != 3)):
			raise Exception(f"Image given in function {callerFunc} does not have 3 channels.")

	if sameChannelsNum:
		if img.ndim != img2.ndim:	# same number of dimensions
			raise Exception(f"Images given in function {callerFunc} don't have the same number of dimensions.")

		if img.ndim == 3 and img.shape[2] != img2.shape[2]:	# same number of channels, eg RGB vs RGBA
			raise Exception(f"Images given in function {callerFunc} don't have the same number of channels.")
