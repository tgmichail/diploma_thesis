import numpy as np

from .assertion import assertImg

#Fourier Transformation
def fourierTransform(img):

	assertImg(img, gray=True)

	#input must be grayscale
	f = np.fft.fft2(img)
	fshift = np.fft.fftshift(f)
	magnitudeSpectrum = np.log(np.abs(fshift) + 0.001)
	# We add something, because otherwise we could have log(0) = -inf.
	# We do not add 1 but 0.001, because if we added something big like 1, the min log would be 0 and
	# we would only utilize half of the available space (floatMatr->probMatr) which is from -1 to 1
	phaseSpectrum = np.angle(fshift) / np.pi
	# Divide by pi, so that it fits in [-1,1]

	return {"floatMatr_magnitude": magnitudeSpectrum, "probMatr_phase": phaseSpectrum}


def invFourierTransform(floatMatr_magnitudeSpectrum, probMatr_phaseSpectrum):

	assertImg(floatMatr_magnitudeSpectrum, probMatr_phaseSpectrum, gray=True, sameDimensions=True)

	fshift = np.exp(floatMatr_magnitudeSpectrum - 0.001)*np.exp(1j*probMatr_phaseSpectrum * np.pi)
	f = np.fft.ifftshift(fshift)
	img = np.fft.ifft2(f)
	img_back = np.real(img).astype('uint8')

	return {'img': img_back}

#Create mask/window from skimage.filters.window.
#Multiply an image with this mask. Thus i can combine two masks, and then apply them

# def createMaskFromDefault
