/**
 * Microservice acting as Bridge between Raspberry Pi and Kafka Streams Data Bus
 * Receives HTTP Requests from Raspberry Pi when RFID card is read and sends the received data
 * on the data bus.
 *
 * @type {createApplication}
 */

var express = require('express');
var app = express();
var http = require('http');
var kafka = require('kafka-node');
//const { exec }  = require('child_process');

app.use(express.static('web'));

app.listen(5000, function () {
  console.log('Producer listening on port 5000!');
});

app.post('/kafka/:id', function (req, res) {

    console.log(req.params.id);
    let id = req.params.id;

    //send userId to Kafka Databus
    var Producer = kafka.Producer;
    var KeyedMessage = kafka.KeyedMessage;
    var client = new kafka.KafkaClient();
    var producer = new Producer(client);
    var km = new KeyedMessage('userId', id);
    var payloads = [
        {topic: 'pdi-topic', messages: km}
    ];

    producer.send(payloads, function (err, data) {
        console.log("Sent: " + data);
    });

    //trigger Camunda
    let options = {
        host: 'localhost',
        port: 8080,
        path: '/engine-rest/process-definition/KarteScannen:1:e8b2d7bd-9cbc-11e9-b6c4-2816a85fc91e/start',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    }).end();

    res.sendStatus(200);

    /*
        //old Version: running Java Programm which acts as Producer for Kafka

        exec('java -jar C:\\Users\\Tim\\IdeaProjects\\kafkatest\\target\\kafkatest-1.0-SNAPSHOT-jar-with-dependencies.jar ' + id, (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command
            return;
        }
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
*/

});



