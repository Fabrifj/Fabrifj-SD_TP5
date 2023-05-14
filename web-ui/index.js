const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8888 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Parsear la cadena JSON recibida
    const fileData = JSON.parse(message);

    // Extraer el nombre y los datos del archivo
    const fileName = fileData.name;
    const fileContent = Buffer.from(fileData.data);

    // Guardar el archivo en el servidor
    fs.writeFile(fileName, fileContent, (err) => {
      if (err) {
        console.error('Error al guardar el archivo:', err);
      } else {
        console.log('Archivo guardado:', fileName);
      }
    });
    //Enviar archivo
    fs.readFile('./D2R8.gif', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo:', err);
        // Enviar un mensaje de error al cliente
        ws.send('Error al leer el archivo');
      } else {
        // Enviar el contenido del archivo al cliente
        ws.send(data);
      }
    });
  });
});