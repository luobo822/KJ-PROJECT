var fs = require('fs')
    , http = require('http')
    , socketio = require('socket.io');
 
var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-type': 'text/html'});
}).listen(2333, function() {
    console.log('监听: http://157.7.138.169:2333');
});
 
socketio.listen(server).on('connection', function (socket) {
    socket.on('message', function (msg) {
        console.log('收到消息', msg);
        socket.broadcast.emit('message', msg);
    });
});