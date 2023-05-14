const mqtt = require('mqtt');
const fs = require('fs');
var path = require("path");
const express = require('express');
const ini = require('ini');
const { exec } = require('child_process');
const client = mqtt.connect('mqtt://broker_mqtt:1883');
const app = express();

const port = 5000;

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const master_slave_proto = grpc.loadPackageDefinition(protoLoader.loadSync('./master_slave.proto')).master_slave;
const server = new grpc.Server();
var ini_num = 1;
var run_ID = 1;
let busy_slaves = [];
let free_slaves = [];

//const image_dir = path.resolve(process.cwd(),"human.png");

//split function
var ini_config = ini.parse(fs.readFileSync('./planet.ini', 'utf-8'));
function split(){
  for (let i = 1; i <= 5; i++) {
    ini_config.Subset_Start_Frame=i
    ini_config.Subset_End_Frame=i
    fs.writeFileSync(`./${i}.ini`, ini.stringify(ini_config));
  }
  
}
split();
// grpc Service 
function SendIni(call,callback){//agregar la ip de slave a busy
  console.log("ini request de slave: ",call.request.ip);
  if(ini_num<=5) //valor demuestra
  {
    console.log(call.request.ip);
    const ini_file = fs.readFileSync(`./${ini_num}.ini`);
    const bytes = new Uint8Array(ini_file);
    console.log("from server:",bytes);
    const ini_ = {
      inifile: bytes,
      runid: run_ID,
      ininum: ini_num
    };
    callback(null,ini_)
    ini_num++;
  }
};
function RegisterSlave(call,callback){
  callback(null, {message: 'ok'});
  //console.log("request de slave"+call.request.ip);
};
function SendImage(call,callback){ // crear los folders cuando se haya un nuevo run user. Agregar la ip del slave a free
  exec(`mkdir ${call.request.runid}`, (error,stdout,stderr)=>{console.log("mkdir",stdout)}) //ya deberia existir
  var image_dir = `./${call.request.runid}/${call.request.ininum}.png`;
  fs.writeFileSync(image_dir, call.request.image);
  console.log("image",call.request.image);
  callback(null, {message: 'ok'});

};
server.addService(master_slave_proto.MasterSlaveService.service,{
    SendIni: SendIni,
    RegisterSlave: RegisterSlave,
    SendImage: SendImage
  });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('Master gRPC server listening on port 50051');
});


// mqtp Service 
client.on('connect', () => {
  client.subscribe('start');
});
client.on('message', (topic, message) => {
  const msg = JSON.parse(message.toString());

  if (topic === 'start') {
    console.log('Distribuyendo tareas a los Slaves');
    slaves.forEach((slave) => {
    console.log('Enviando tarea al Slave con slave_id:', slave.slave_id); // Agrega esta línea
    const workMessage = {
      slave_id: slave.slave_id,
    };
    client.publish('work', JSON.stringify(workMessage));
    console.log('Tarea enviada a Slave:', slave.slave_id);
  });
  } 
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Master service listening at http://0.0.0.0:${port}`);
});