/* jshint esversion: 6 */
const WebSocket = require('ws');
const SocketServer = require('ws').Server;
const express = require('express');
const mqtt = require("mqtt");

const MQTT_URL = "mqtt://127.0.0.1";
const CLIENT_ID = "mqtt-node-graph";
const MQTT_TEMPERATURE_TOPIC = "/rooms/hall/temperature";
const MQTT_DEVICE_CONFIG_TOPIC = "/configuration/mqtt-node-sensor";

const mqttClient = mqtt.connect(MQTT_URL, {
    clientId: CLIENT_ID
});

mqttClient.on("connect", () => {
    console.log("Connected to mqtt broker, subscribing to topic %s", MQTT_TEMPERATURE_TOPIC);
    mqttClient.subscribe(MQTT_TEMPERATURE_TOPIC);
});

//init Express
const app = express();

//init Express Router
const router = express.Router();
const port = process.env.PORT || 18080;

//connect path to router
app.use("/", router);
app.use(express.static('static'));

const server = app.listen(port, () => console.log('node.js static server listening on port: %s', port));

const wss = new SocketServer({ server });

wss.on('connection', function connection(ws) {
    console.log("Websocket connection estabilished.");

    ws.on('message', function incoming(message) {
        console.log('Received message from websocket: %s', message);
        mqttClient.publish(MQTT_DEVICE_CONFIG_TOPIC, message.toString());
    });

});

mqttClient.on("message", (topic, message) => {
    if (MQTT_TEMPERATURE_TOPIC === topic) {

        console.log("Received mqtt message, forwarding to websocket clients");

        try {
            const data = JSON.parse(message.toString());

            // FIXME add data transformation

            wss.clients.forEach(function each(client) {

                if (client.readyState === WebSocket.OPEN) {
                    console.log("Found a working ws client, sending data...");
                    client.send(JSON.stringify(data));
                }

            });

        } catch (e) {
            console.log("Exception occured: %s", e);
        }
    }
});