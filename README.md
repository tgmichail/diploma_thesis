

## Set up

### Python server, local installation

Ensure you have at least Python 3.8 and pip installed.
Clone this repo: `git clone https://github.com/tgmichail/diploma_thesis.git`

Inside the repo folder, install the Python dependencies: `pip install -r requirements.txt`

Finally, run the server: `python3 server.py`

### Node-red, docker installation

After downloading the file Dockerfile_nodered from this repo, build it: (this may require sudo)
```
docker build -f Dockerfile_nodered -t remote-image-processing-nodered
```
This will create an image, which you can then run to create a container. Don't forget to publish port 1880!
```
docker run -p 1880:1880 remote-image-processing-nodered
```

### Node-red, local installation

These steps have been tested in a clean vm with Ubuntu server 18.04.

It is a prerequisite to have Node.js at least v.8, and node-red at least v.1.3.
These can be installed like so:
```
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get instal nodejs
sudo npm install -g --unsafe-perm node-red
```

Then, clone this repo: `git clone https://github.com/tgmichail/diploma_thesis.git`

Install the package dependencies:
```
cd diploma/myNodes
npm install
```
Instal our package and the image previewer into node-red
```
cd ~/.node-red/
npm install ../diploma/myNodes
npm install node-red-contrib-image-output
```
Finally, copy the settings file to enable the option of storing
context to files (used in the 'generic call' node).
Note: you may want to adjust some of the other settings yourself.
```
mv ~/.node-red/settings.js ~/.node-red/settings.js.bak
cp ~/diploma/settings.js ~/.node-red/
```

### MQTT broker

You can use any mqtt broker you prefer. You can either install one locally, run it in a docker container,
or use a public mqtt online broker. You must configure the Python server and the NodeRed my-mqtt-broker
global config node, with the broker's details: IP address, port, username, password, and mqtt channel.

Some implementations of mqtt brokers you can use include Mosquitto or RabbitMQ with an mqtt plugin enabled.

