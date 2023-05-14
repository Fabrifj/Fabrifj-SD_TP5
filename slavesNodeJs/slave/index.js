const os = require('os');
const ip_ = require('ip');
 exec  = require('child_process').exec;
const slaveid = os.hostname(); 
const ip = ip_.address(); 
const fs = require('fs');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { response } = require('express');
const master_slave_proto = grpc.loadPackageDefinition(protoLoader.loadSync('./master_slave.proto')).master_slave;
const clientgrpc = new master_slave_proto.MasterSlaveService('master:50051', grpc.credentials.createInsecure());

//var imageasBytes;var file;var runid;var ininum;
var hasIni = false;
const registerMessage = {
  ip: ip
};


//child_process  +Ihuman.pov +Ohuman.png +FN Width=1024 Height=768 Output_File_Name=./output/
createIni();
function createIni(){
  clientgrpc.SendIni(registerMessage, function (error, response){
    //console.log("ini_file: ", response.inifile);
    file = `${response.runid}_${response.ininum}.ini`;
    fs.writeFileSync(file, response.inifile);
    console.log("runid received from server", response.runid);
    hasIni = true;
    
    createImage(response.runid, response.ininum, file);
  });
}
//problema -> undefined  docker run -v $PWD:/source -v $PWD/images:/output jmaxwilson/povray $1.ini +I$1.pov +O$1.png +FN Width=1024 Height=768 Output_File_Name=/output/
function createImage(run_ID, ini_num, ini_file,)
{
  
  var pov= exec(`export TERM=xterm && mkdir ${run_ID} && povray ${ini_file} +Iplanet.pov +O${ini_num}.png +FN Width=1024 Height=768  Output_File_Name=./${run_ID}/`,  (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log("llego aqui --");
    var imageasBytes = readImageAsBytes(`/slavesNodeJs/${run_ID}/*${ini_num}.png`);
      console.log("llego aqui");
      clientgrpc.SendImage({image:imageasBytes,runid: run_ID, ininum: ini_num}, function(error,response){
        if (error) {
          console.log(error);
        }
        console.log('image sent');
      });
  });
  pov.stdout.on('data', function (data) {
                            
    //console.log('[LOG] ' + data);

  });
  pov.stderr.on('data', function (data) {

    //console.log('[LOG-ERR] ' + data);

});
 /* if (fs.existsSync(`/slavesNodeJs/${run_ID}/*${ini_num}.png`)) {
    console.log('El archivo existe');
    
  } */
 
  hasIni = false;
}

function readImageAsBytes(imagePath) {
  const image = fs.readFileSync(imagePath);
  const bytes = new Uint8Array(image);
  return bytes;
}

console.log('Mensaje de registro del Slave:', registerMessage); 
clientgrpc.RegisterSlave(registerMessage, function (error, response) {
  console.log("error: ",error);
  console.log(response.message);
});

