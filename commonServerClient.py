import numpy as np
import cv2 as cv
import base64
from commlib.msg import RPCMessage
from dataclasses import dataclass

class ImageCommandMsg(RPCMessage):
	@dataclass
	class Request(RPCMessage.Request):
		funcName: str
		params: dict
		#params: dict aka key value pairs, wste na einai h morfh twn input koinh
		returnLabel: str = None

	@dataclass
	class Response(RPCMessage.Response):
		statusMsg: str
		pyTime: float
		results: dict = None
		funcTime: float = None


def isCustomInstance(varName: str, typ: str) -> bool:

	return varName == typ or varName.startswith(typ + '_')


def base64ToImage(inp: str) -> np.ndarray :
	# Seems to also work for 16bit pngs, as is.

	if inp is None:
		return None

	nparr = np.frombuffer(base64.b64decode(inp), np.uint8)
	img = cv.imdecode(nparr, cv.IMREAD_UNCHANGED)

	if img is None:
		raise Exception('A given input cannot be decoded as image. Make sure it is valid jpg/png/bmp, base64 encoded')

	return img
	# or maybe
	#img = cv.imdecode(nparr,cv.IMREAD_COLOR)

def imageToBase64(img: np.ndarray) -> str :

	retval, buffr = cv.imencode('.png', img)	#for report: png is compressed, but also lossless, compared to jpg which is lossy
	return base64.b64encode(buffr).decode("utf-8")
	# .decode() converts bytes to str


def probMatrToImage(inp: np.ndarray) -> np.ndarray:
	# from floats in [-1, 1] to ints in [0, 2^16)
	rounded = np.round((inp + 1) * 32768)
	return np.uint16(np.clip(rounded, 0, 65535))

def imageToProbMatr(inp) -> np.ndarray:
	# from ints in [0, 2^16) to floats in [-1, 1]
	if inp is None:
		return None	# Otherwise it would return np.nan

	return (np.array(inp, dtype=float) / 32768) - 1


def encodeFloatMatr(inp: np.ndarray) -> dict:
	maxabs = np.abs(inp).max().astype(float)
	img = probMatrToImage(inp / maxabs)
	return {'scale': maxabs, 'matr': imageToBase64(img)}

def decodeFloatMatr(inp: dict) -> np.ndarray:
	probMatr = imageToProbMatr(base64ToImage( inp['matr'] ))
	return probMatr * inp['scale']


def decodeParams(params: dict, removePrefix: bool = False) -> dict:

	outpParams = {} # because we may want to change the key names
	# to remove the prefix, if we call an opencv function

	for index in params:

		if isCustomInstance(index, 'img'):
			dec = base64ToImage(params[index])

			# If it is an opencv function, we must remove img_ before the argument name
			# Thankfully, opencv does not have any argument img_something.
			if removePrefix and index.startswith('img_'):
				outpParams[index[4:]] = dec
			else:
				outpParams[index] = dec

		elif isCustomInstance(index, 'probMatr'):
			dec = imageToProbMatr(base64ToImage(params[index]))

			if removePrefix and index.startswith('probMatr_'):
				outpParams[index[9:]] = dec
			else:
				outpParams[index] = dec

		elif isCustomInstance(index, 'floatMatr'):
			dec = decodeFloatMatr(params[index])

			if removePrefix and index.startswith('floatMatr_'):
				outpParams[index[10:]] = dec
			else:
				outpParams[index] = dec

		elif isCustomInstance(index, 'contour'):
			dec = np.array(params[index])

			if removePrefix and index.startswith('contour'):
				outpParams[index[8:]] = dec
			else:
				outpParams[index] = dec

		else:
			outpParams[index] = params[index]
	return outpParams


def encodeParams(outp: dict) -> dict:
	for i in outp:
		if isCustomInstance(i, 'img'):
			outp[i] = imageToBase64(outp[i])

		elif isCustomInstance(i, 'probMatr'):
			outp[i] = imageToBase64(probMatrToImage(outp[i]))

		elif isCustomInstance(i, 'floatMatr'):
			outp[i] = encodeFloatMatr(outp[i])

		elif isCustomInstance(i, 'contour'):
			#or isCustomInstance(i, 'points') or
			#isCustomInstance(i, 'lines') or isCustomInstance(i, 'circles') or
			#isCustomInstance(i, 'bbPoints') or

			# returns that exist:
			#colors, hist
			#lines and circles might need renaming
			#contour, circle, bbPoints
			#bbList
			outp[i] = outp[i].tolist()
	return outp
