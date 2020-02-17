var LISTEN_IP = '0.0.0.0'; 
var LISTEN_PORT = 8086; 
var DEFAULT_FILE = "index.html"; 

const WebSocket = require('ws')
var https = require('https'), 
fs = require('fs'); 

const options = {
  key: fs.readFileSync('certs/www2.digitaltrustnexus.net.key'),
  cert: fs.readFileSync('certs/www2.digitaltrustnexus.net.cer'),
  //ca: [fs.readFileSync('apig-cert.pem')],
  //ca: [fs.readFileSync('nuc1_cert.pem'), fs.readFileSync('ca.cer'), fs.readFileSync('fullchain.cer')],
  ca: [fs.readFileSync('certs/apig-cert.pem'), fs.readFileSync('certs/ca.cer'), fs.readFileSync('certs/fullchain.cer')],
  requestCert: true, 
  rejectUnauthorized: false,
  port: LISTEN_PORT
};

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

var server  = https.createServer(options, (socket) =>{
  console.log('server connected', 
  socket.authorized ? 'authorized' : 'unauthorized');
});

server.on('request',  
    function(request, response){ 
        console.log(request.socket.getPeerCertificate());
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

var httpsServer  = https.createServer(options); 
httpsServer.listen(LISTEN_PORT+1, LISTEN_IP); 

const ws = new WebSocket.Server({server: httpsServer})
console.log('Server running at http://' + LISTEN_IP + ':' + LISTEN_PORT); 
//var clients = [];
var client;

ws.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
    if (message == "init") {
    	client = ws;
    } else {
        client.send(message);
    }
  })
})

