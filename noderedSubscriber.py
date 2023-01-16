import sys
import time
import base64
import json
from datetime import datetime
from dataclasses import dataclass

from commlib.msg import PubSubMessage
from commlib.transports.mqtt import Subscriber, ConnectionParameters


@dataclass
class dataMessage(PubSubMessage):
	data: dict
	key: str
	times: dict


counter = 0
def nodered_data_callback(msg):
	global counter
	print("Got message!")

	if msg.data is None:
		print("msg.data was None")
		return

	counter += 1
	if msg.key == "floatMatr":
		msg.key = "probMatr"
		msg.data = msg.data.matr

	if msg.key == "img" or msg.key == "probMatr":	# b64 encoded img
		nparr = base64.b64decode(msg.data)
		with open(path + f"_{initTime}_{counter}.png", "wb") as file:
		# All the nodeRED nodes, produce png images.
		# If you send something directly to the subscriber, that is not png,
		# you will need to remove or change the .png ending.
			file.write(nparr)

	else:   # I assume it is a JSON Object
		with open(path + f"_{initTime}_{counter}", "w") as file:
			file.write(json.dumps(msg.data))


if __name__ == "__main__":
	initTime = datetime.now().strftime("%m%d%H%M%S")	# eg 0106094927 that means Jan 06, 09:49:27

	# Parse the arguments
	if len(sys.argv) == 3:
		topic = sys.argv[1]
		path = sys.argv[2]

	else:
		print("usage: python3 noderedSubscriber.py <topic> <data-file-path>")
		print("Results will be saved in files <data-file-path>_init-time_0, <data-file-path>_init-time_1, etc")
		sys.exit(1)

	# Create the connection objects
	conn_params = ConnectionParameters(host='155.207.19.251', port=1883)
	conn_params.credentials.username = 'se2:student'
	conn_params.credentials.password = 'student'

	sub = Subscriber(topic=topic, msg_type=dataMessage,
		on_message=nodered_data_callback, conn_params=conn_params)
	sub.run()

	while True:
		time.sleep(0.001)
