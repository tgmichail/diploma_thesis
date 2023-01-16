from commlib.node import Node, TransportType
from commlib.transports.mqtt import ConnectionParameters

from commonServerClient import ImageCommandMsg, isCustomInstance, encodeParams, decodeParams

import numpy as np
import cv2 as cv
import json
from time import process_time
import traceback
import functions


ListCvFuncReturns = {'line':'img', 'circle':'img', 'dellipse':'img',
'polyline':'img', 'putText':'img', 'split': ['img_0', 'img_1', 'img_2'], 'copyMakeBorder':'img',
'add':'img', 'addWeighted':'img', 'cvtColor':'img', 'resize':'img',
'warpAffine':'img', 'warpPerspective':'img', 'threshold':'img',
'adaptiveThreshold':'img', 'distanceTransform':'img', 'filter2D':'img',
'blur':'img', 'boxFilter':'img', 'getGaussianKernel':'img', 'medianBlur':'img',
'bilateralFilter':'img', 'Canny':'img', 'drawContours':'img',
'fastNlMeansDenoising':'img', 'fastNlMeansDenoisingColored': 'img',
'inpaint':'img', 'absdiff': 'img', 'GaussianBlur': 'img', 'subtract': 'img',
'findContours':'contourList',
'matchShapes':'number',
'HoughCircles':'circleList',
'approxPolyDP':'contour'}


def on_request(msg: ImageCommandMsg.Request) -> ImageCommandMsg.Response:
	print(f'On-Request: {msg.funcName} , {msg.params.keys()} , {msg.returnLabel}')#, {msg.params.values()}')

	try:
		startTime = process_time()

		# Finds the function with name funcName in the module functions,
		# and if not found, in openCV
		funcToCall = getattr(functions, msg.funcName, None) # None is returned if it does not exist
		funcIsFromCV = False

		if funcToCall is None:
			funcToCall = getattr(cv, msg.funcName) # if funcName not in cv, an Exception is raised
			funcIsFromCV = True

			if msg.returnLabel: # if return Label is given by the user, use that
				cvFuncReturns = msg.returnLabel
			else:
				try:
					cvFuncReturns = ListCvFuncReturns[msg.funcName]
				except KeyError as e:
					raise KeyError(f'Function {msg.funcName} not included in ListCvFuncReturns. Try setting returnLabel') from e

		# Decodes the parameters
		params = decodeParams(msg.params, removePrefix=funcIsFromCV)

		# Runs the function
		print("before function")
		funcStartTime = process_time()
		outp = funcToCall(**params)
		funcTime = process_time() - funcStartTime
		print(f"after function, time: {funcTime}")

		# If it was an openCV function, it creates the return dict
		if funcIsFromCV:

			if isinstance(outp, tuple): # if it returns many things
				if (not isinstance(cvFuncReturns, list)) or len(cvFuncReturns) != len(outp):
					raise Exception(f"Function {msg.funcName} returned {len(outp)} results. Please give as many labels.")

				outp = {key: val for (key,val) in zip(cvFuncReturns, outp)}
				# cvFuncReturns must then be a list or tuple with the dict keys
			else:
				outp = {cvFuncReturns: outp}

		print(outp)

		if not isinstance(outp, dict): # all outp must be dict
			raise Exception(f"output of function {msg.funcName} must be a dict!")

		# Encodes the returned params
		outp = encodeParams(outp)

		# If it is not serializable, the error will be caught outside of here,
		# and won't be able to be communicated to node red. So we check it now.
		try:
			json.dumps(outp)
		except TypeError:
			raise Exception("Output is not JSON serializable. If you used " +
			"Generic Call node, check if you have labeled correctly the expected outputs.")

		pyTime = process_time() - startTime
		# Creates the response
		response = ImageCommandMsg.Response(results = outp, statusMsg = 'Success', funcTime=funcTime, pyTime=pyTime)

	except Exception as e:
		print(traceback.format_exc())
		pyTime = process_time() - startTime
		response = ImageCommandMsg.Response(statusMsg = repr(e), pyTime=pyTime)

	return response




if __name__ == '__main__':

	# Set broker connection parameters
	#192.168.0.127, 5672 amqp localhost
	conn_params = ConnectionParameters(host='localhost', port=1883)
	conn_params.credentials.username = 'guest'
	conn_params.credentials.password = 'guest'
	#conn_params = ConnectionParameters(host='155.207.19.251', port=1883)
	#conn_params.credentials.username = 'se2:student'
	#conn_params.credentials.password = 'student'

	# Create an instance of a Node
	node = Node(node_name='image-node',
				transport_type=TransportType.MQTT,
				#transport_connection_params
				connection_params=conn_params,
				debug=True)

	# Create an RPCService endpoint for the Node
	rpc = node.create_rpc(msg_type=ImageCommandMsg,
						  rpc_name='image_requests', # This is the "topic" of the channel
						  on_request=on_request)

	# Starts the RPCService and wait until an exit signal is catched.
	node.run_forever()
