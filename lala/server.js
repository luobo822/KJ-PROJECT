
var http = require('http');
var mongoose = require('mongoose');
var url = require('url');
var socketio = require ('socket.io');

mongoose.connect('mongodb://localhost/test1');

function startServer(route, handle) {
	http.createServer(function (req, res) {
		var pathname = url.parse(req.url).pathname;
		console.log('request for '+pathname +'received.');
		route(handle, pathname);

  		res.writeHead(200, {'Content-Type': 'text/plain'});
  		res.end();
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');

//below is mongodb sample insert, suica this is for demo only.
// will be used in reg.js, item.js
//schema is not yet defined.

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) // ...
  console.log('meow');
	console.log('save success');
});
}

exports.startServer =startServer;