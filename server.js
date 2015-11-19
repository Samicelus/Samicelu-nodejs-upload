var http = require('http');
var url = require('url');
var net = require('net');
var fs = require('fs');

fs.readFile('./config.json', function (err, data) {
	if (err) throw err;
	uploadServerPort = JSON.parse(data).uploadServerPort;
	
	function start(route, handler) {
		http.createServer(function(request, response) {
	        var pathname = url.parse(request.url).pathname;
	        // 路由到相应的业务逻辑
	        route (pathname, handler, response, request);
	    }).listen(uploadServerPort);
		console.log('server is starting at 5901');
	
		}
	});	

exports.start = start;
