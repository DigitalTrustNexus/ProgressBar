var LISTEN_IP = '0.0.0.0'; 
var LISTEN_PORT = 8086; 
var DEFAULT_FILE = "index.html"; 

const WebSocket = require('ws')
var http = require('http'), 
fs = require('fs'); 


function getExtension(fileName) { 
    var fileNameLength = fileName.length; 
    var dotPoint = fileName.indexOf('.', fileNameLength - 5 ); 
    var extn = fileName.substring(dotPoint + 1, fileNameLength); 
    return extn; 
} 

function getContentType(fileName) { 
    var extentsion = getExtension(fileName).toLowerCase(); 
    var contentType = { 
        'html': 'text/html', 
        'htm' : 'text/htm', 
        'css' : 'text/css', 
        'js' : 'text/javaScript; charset=utf-8', 
        'json' : 'application/json; charset=utf-8', 
        'xml' : 'application/xml; charset=utf-8', 
        'jpeg' : 'image/jpeg', 
        'jpg' : 'image/jpg', 
        'gif' : 'image/gif', 
        'png' : 'image/png', 
        'mp3' : 'audio/mp3', 
        }; 
        var contentType_value = contentType[extentsion]; 
        if(contentType_value === undefined){ 
            contentType_value = 'text/plain';}; 
    return contentType_value; 
} 

var server  = http.createServer(); 
server.on('request', 
    function(request, response){ 
        console.log('Requested Url:' + request.url); 
        var requestedFile = request.url; 
        requestedFile = (requestedFile.substring(requestedFile.length - 1, 1) === '/')?requestedFile + DEFAULT_FILE : requestedFile; 
        console.log('Handle Url:' + requestedFile); 
        console.log('File Extention:' + getExtension( requestedFile)); 
        console.log('Content-Type:' + getContentType( requestedFile)); 
        fs.readFile('.' + requestedFile,'binary', function (err, data) { 
            if(err){ 
                response.writeHead(404, {'Content-Type': 'text/plain'}); 
                response.write('not found\n'); 
                response.end();    
            }else{ 
                response.writeHead(200, {'Content-Type': getContentType(requestedFile)}); 
                response.write(data, "binary"); 
                response.end(); 
            } 
        }); 
    } 
); 

server.listen(LISTEN_PORT, LISTEN_IP); 
const wss = new WebSocket.Server({ port: 8087 })
console.log('Server running at http://' + LISTEN_IP + ':' + LISTEN_PORT); 
//var clients = [];
var client;

wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
    if (message == "init") {
    	client = ws;
    } else {
        client.send(message);
/*
      for(var i = 0; i < clients.length; i++) {
          clients[i].send(message);
      }
*/
    }
  })
})


