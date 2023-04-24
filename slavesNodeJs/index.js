const mqtt = require('mqtt');
const os = require('os');
const client = mqtt.connect('mqtt://broker_mqtt:1883');

// observar
const slave_id = os.hostname(); 
const ip = '172.2.0.2'; 

client.on('connect', () => {
  client.subscribe('work');

  const registerMessage = {
    slave_id: slave_id,
    ip: ip,
    timestamp: new Date().toISOString(),
  };

  client.publish('register', JSON.stringify(registerMessage));
  console.log('Registrado como Slave:', registerMessage);
});

client.on('message', (topic, message) => {
  const msg = JSON.parse(message.toString());

  if (topic === 'work' && msg.slaveid === slave_id) {
    const randomDelay = Math.floor(Math.random() * 10) + 1;

    setTimeout(() => {
      const resultsMessage = {
        slave_id: slave_id,
        duration: randomDelay,
        timestamp: new Date().toISOString(),
      };

      client.publish('results', JSON.stringify(resultsMessage));
      console.log('Resultado enviado al Master:', resultsMessage);
    }, randomDelay * 1000);
  }
});
