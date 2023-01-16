import sys
import time
import base64
from dataclasses import dataclass

from commlib.msg import PubSubMessage
from commlib.transports.mqtt import Publisher, ConnectionParameters


@dataclass
class ImgMessage(PubSubMessage):
	imgb64: str


if __name__ == "__main__":
	# Parse the arguments
	if len(sys.argv) == 3:  #no repeat
		topic = sys.argv[1]
		imgPath = sys.argv[2]
		repeatTime = -1

	elif len(sys.argv) == 4: #repeat every repeat-time
		topic = sys.argv[1]
		imgPath = sys.argv[2]
		repeatTime = sys.argv[3]
	else:
		print("usage: python3 imgPublisher.py <topic> <img-path> [repeat-time]")
		print("suggested repeat-time > 5s")
		sys.exit(1)

	# Create the connection objects
	conn_params = ConnectionParameters(host='155.207.19.251', port=1883)
	conn_params.credentials.username = 'se2:student'
	conn_params.credentials.password = 'student'

	pub = Publisher(topic=topic, msg_type=ImgMessage, conn_params=conn_params)

	# Form and publish the message
	if repeatTime <= 0:
		with open(imgPath, "rb") as imgFile:
			imgb64 = base64.b64encode(imgFile.read()).decode("utf-8")

		msg = ImgMessage(imgb64 = imgb64)
		pub.publish(msg)   # QoS is always set to 0
		time.sleep(1)

		sys.exit(0)

	else:
		with open(imgPath, "rb") as imgFile:
			imgb64 = base64.b64encode(imgFile.read())   #.decode("utf-8")

		msg = ImgMessage(imgb64 = imgb64)
		pub.publish(msg)   # QoS is always set to 0

		time.sleep(repeatTime)
