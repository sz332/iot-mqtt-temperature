/* jshint esversion: 6 */
const MQTT_URL = "mqtt://127.0.0.1";
const CLIENT_ID = "mqtt-node-sensor";

const MQTT_DEVICE_CONFIG_TOPIC = "/configuration/" + CLIENT_ID;
const MQTT_TEMPERATURE_TOPIC = "/rooms/hall/temperature";

const DEFAULT_INTERVAL_IN_MSEC = 5000;

let mqtt = require("mqtt");

console.log("Staring application...");

let mqttClient = mqtt.connect(MQTT_URL, {
    clientId: CLIENT_ID
});

mqttClient.on("connect", () => {
    console.log("Connected to mqtt broker...");

    mqttClient.subscribe(MQTT_DEVICE_CONFIG_TOPIC);

    mqttClient.on("message", (topic, message) => {
        if (MQTT_DEVICE_CONFIG_TOPIC === topic) {
            try {

                const data = JSON.parse(message.toString());

                if (data.period && Number.isInteger(data.period) && periodicJob) {
                    clearInterval(periodicJob);
                    periodicJob = setInterval(intervalCallback, data.period * 1000);
                }

            } catch (e) {
                console.log("JSON parse failed " + e);
            }
        }
    });

    let periodicJob = setInterval(intervalCallback, DEFAULT_INTERVAL_IN_MSEC);
});

function temperature() {
    return JSON.stringify({
        temperature: 20 + Math.floor(Math.random() * 10),
        date: new Date().toISOString()
    });
}

function intervalCallback() {
    if (mqttClient.connected == true) {
        mqttClient.publish(MQTT_TEMPERATURE_TOPIC, temperature(), {});
    }
}