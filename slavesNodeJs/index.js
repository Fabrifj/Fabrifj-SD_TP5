// Imports
const mqtt = require('mqtt');
const os = require('os');
const clientmqtt = mqtt.connect('mqtt://broker_mqtt:1883');

const slave_id = os.hostname(); 
const ip = '172.2.0.2'; 

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const master_slave_proto = grpc.loadPackageDefinition(protoLoader.loadSync('./master_slave.proto')).master_slave;

const clientgrpc = new master_slave_proto.MasterSlaveService('master:50051', grpc.credentials.createInsecure());


// mqtp
clientmqtt.on('connect', () => {
  clientmqtt.subscribe('work');

  const registerMessage = {
    slave_id: slave_id,
    ip: ip,
    timestamp: new Date().toISOString(),
  };

  console.log('Mensaje de registro del Slave:', registerMessage); // Agrega esta línea

  // Registra el Slave en el Master
  clientgrpc.RegisterSlave(registerMessage, (error, response) => {
    if (error) {
      console.error('Error al registrar el Slave:', error);
    } else {
      console.log('Registro exitoso:', response.message);
    }
  });
});

clientmqtt.on('message', (topic, message) => {
  const msg = JSON.parse(message.toString());

  if (topic === 'work' && msg.slaveid === slave_id) {
    const randomDelay = Math.floor(Math.random() * 10) + 1;

    setTimeout(() => {
      const resultsMessage = {
        slave_id: slave_id,
        data: JSON.stringify({
          duration: randomDelay,
          timestamp: new Date().toISOString(),
    }),
  };

  // Envía un resultado al Master
    clientgrpc.SendResult(resultsMessage, (error, response) => {
      if (error) {
        console.error('Error al enviar el resultado:', error);
      } else {
        console.log('Resultado recibido:', response.message);
      }
    });
  }, randomDelay * 1000);
  }
});
