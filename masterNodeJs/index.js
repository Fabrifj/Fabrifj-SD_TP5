// import
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker_mqtt:1883');

const express = require('express');
const app = express();
const port = 5000;

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const master_slave_proto = grpc.loadPackageDefinition(protoLoader.loadSync('./master_slave.proto')).master_slave;
const server = new grpc.Server();
let slaves = [];

// grpc Service 
server.addService(master_slave_proto.MasterSlaveService.service, {
  RegisterSlave: (call, callback) => {
    console.log('Recibiendo solicitud de registro de Slave:', call.request);
    console.log('slave_id recibido:', call.request.slave_id); // Agrega esta línea
    slaves.push(call.request);
    console.log('Lista actual de Slaves:', slaves);
    callback(null, { message: 'Registro exitoso' });
  },
  SendResult: (call, callback) => {
    callback(null, { message: 'Resultado recibido' });
  }
});


server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('Master gRPC server listening on port 50051');
});

// express Service 

app.get('/', (req, res) => {
  res.send('Hello, this is the Master service!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Master service listening at http://0.0.0.0:${port}`);
});

// mqtp Service 

client.on('connect', () => {
  client.subscribe('start');
});

client.on('message', (topic, message) => {
  const msg = JSON.parse(message.toString());

  if (topic === 'start') {
    console.log('Distribuyendo tareas a los Slaves');
    // slaves.forEach((slave_id) => {
    // const workMessage = {
    //   slaveid: slave_id,
    //     };
    //    client.publish('work', JSON.stringify(workMessage));
    //     console.log('Tarea enviada a Slave:', slave_id);
    slaves.forEach((slave) => {
    console.log('Enviando tarea al Slave con slave_id:', slave.slave_id); // Agrega esta línea
    const workMessage = {
      slaveid: slave.slave_id,
    };
    client.publish('work', JSON.stringify(workMessage));
    console.log('Tarea enviada a Slave:', slave.slave_id);
  });
  } 
});
