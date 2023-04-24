const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker_mqtt:1883');

let slaves = [];

client.on('connect', () => {
  client.subscribe('register');
  client.subscribe('start');
  client.subscribe('results');
});

client.on('message', (topic, message) => {
  const msg = JSON.parse(message.toString());

  if (topic === 'register') {
    slaves.push(msg);
    console.log('Slave registrado:', msg);
  } else if (topic === 'start') {
    console.log('Distribuyendo tareas a los Slaves');
     slaves.forEach((slave) => {
       const workMessage = {
         slaveid: slave.slave_id,
       };
       client.publish('work', JSON.stringify(workMessage));
       console.log('Tarea enviada a Slave:', slave.slave_id);
     });
  } else if (topic === 'results') {
    console.log('Resultado recibido del Slave:', msg);
  }
});
