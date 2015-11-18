var server = require('./server');
var router = require('./router');
var requestHandler = require('./requestHandler');
var formidable = require('formidable'); // require路径搜索算法？？

var handler = {};
handler['/'] = requestHandler.start;
handler['/start'] = requestHandler.start;
handler['/upload'] = requestHandler.upload;
handler['/uploadDoc'] = requestHandler.uploadDoc;
handler['/downloadDoc'] = requestHandler.downloadDoc;
handler['/download'] = requestHandler.download;
server.start(router.route, handler);
