var querystring = require('querystring'),
    fs = require('fs'),
    formidable = require('formidable');

var url = require('url');
var gm = require('gm').subClass({imageMagick: true});	
var dgram = require('dgram');
// s 这里是个全局的 socket
var s = dgram.createSocket('udp4');

var rootPath = "D:/productData/nodejs_upload/";

			//UDP通信端口绑定,用于指定UDP监听message端口		
			s.bind(7006,"127.0.0.1");
			
			console.log("UDP datagrame bind to [127.0.0.1] on port [7007].");			
			
			s.on('message',function(msg,rinfo){
				console.log("UDP message got:["+msg+"] from " +rinfo.address+":"+rinfo.port);
			});	

var exec = require('child_process').exec;
var zip = require('node-native-zip');
var archive = new zip();

function start (response,request) {
    console.log('start module');
	fs.readFile('./html/index.html', function (err, data) {
		if (err){
			console.log(err);
			response.write("err"+err);
			response.end();
		}else{
			var body = data;
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(body);
			response.end();			
			}
	});
}


function upload (response, request) {
    console.log('upload module');
    var form = new formidable.IncomingForm();
	form.uploadDir='tmp';
	console.log("about to parse");
    form.parse(request, function (error, fields, files) {
		console.log("parsing done");
		//前端程序的appid
		var appid = fields.appid;
		console.log("appid:"+appid);
		//上传文件名，包含扩展名
		var fileName = fields.fileName;
		console.log("fileName:"+fileName);
		//文件的存储路径
		var savePath = fields.savePath;
		console.log("savePath:"+savePath);
		//时间戳
		var timestamp = fields.timestamp;
		console.log("timestamp:"+timestamp);
		//上传的文件类型
		var fileType = fields.fileType;
		console.log("fileType:"+fileType);
		
		//创建保存文件的文件夹
		fs.mkdir('./upload/'+appid+'/',function(err,data){
			fs.renameSync(files.upload.path, './upload/'+appid+'/'+fileName);
			
			if((fileType == "image/png")||(fileType == "image/jpeg")||(fileType == "image/jpg")||(fileType == "image/bmp")){
				//制作缩略图
				gm('./upload/'+appid+'/'+fileName).resize(100, 100, '!').noProfile().write('./upload/'+appid+'/small_'+fileName,function(err){
					if(err){
						console.log(err);
						}else{
							console.log("done resize image");
							//压缩列表
							var file1 = rootPath+'upload/'+appid+'/'+fileName;
							var file2 = rootPath+'upload/'+appid+'/small_'+fileName;
							var fileNameUncap = delExtension(fileName);
							var zipPath = rootPath+'upload/'+appid+'/'+fileNameUncap+'.zip'
							archive.addFiles([{name:fileName,path:file1},{name:"small_"+fileName,path:file2}],function(err){
								if(err)
									return console.log("err while adding files", err);
								var buff = archive.toBuffer();
								fs.writeFile("./upload/"+appid+'/'+fileNameUncap+'.zip', buff, function(){
									console.log("Finished");
									//返回给页面的消息
									var ret = JSON.stringify({result:"success",msg:"file zipped, prepare to download...",data:'{"savePath":"'+savePath+'"}'});
									response.writeHead(200, {"Content-Type":"text/plain; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"no-cache, no-store, must-revalidate","Pragma":"no-cache","Expires":"0"});
									response.write(ret);
									response.end();
									//将下载命令发送给socket manager
									console.log("sending msg to "+appid);
									var msg = {result:"update finished",fileName:fileName,appid:appid,savePath:savePath,path:zipPath};
									
									buf = new Buffer(JSON.stringify({command:"sendDownloadCode",appid:appid,msg:msg}), 'utf-8');
									console.log("buffer content [" + buf +"]");
									s.send(buf, 0, buf.length, 7007, "127.0.0.1", function(err) {
										if(err){
											console.log("error:"+err+" socket closed");
											s.close();
											}
										});	
									});
								});								
							}
					});				
				}else{
					console.log("not an image");
					//压缩列表
					var file1 = rootPath+'upload/'+appid+'/'+fileName;
					var fileNameUncap = delExtension(fileName);
					var zipPath = rootPath+'upload/'+appid+'/'+fileNameUncap+'.zip';
					
					archive.addFiles([{name:fileName,path:file1}],function(err){
						if(err)
							return console.log("err while adding files", err);
						var buff = archive.toBuffer();
						fs.writeFile("./upload/"+appid+'/'+fileNameUncap+'.zip', buff, function(){
							console.log("Finished");
							//返回给页面的消息
							var ret = JSON.stringify({result:"success",msg:"file zipped, prepare to download...",data:'{"savePath":"'+savePath+'"}'});
							response.writeHead(200, {"Content-Type":"text/plain; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"no-cache, no-store, must-revalidate","Pragma":"no-cache","Expires":"0"});
							response.write(ret);
							response.end();
							//将下载命令发送给socket manager
							console.log("sending msg to "+appid);
							var msg = {result:"update finished",fileName:fileName,appid:appid,savePath:savePath,path:zipPath};
							
							buf = new Buffer(JSON.stringify({command:"sendDownloadCode",appid:appid,msg:msg}), 'utf-8');
							console.log("buffer content [" + buf +"]");
							s.send(buf, 0, buf.length, 7007, "127.0.0.1", function(err) {
								if(err){
									console.log("error:"+err+" socket closed");
									s.close();
									}
								});	
							});
						});
					}
			});
    });
}


function uploadDoc (response,request) {
    console.log('upload page');
	//取出get请求中的参数
	var param = url.parse(request.url,true).query;
	console.log(param);
	if(typeof(url.parse(request.url,true).query.appid)!="undefined"){
		var appid = url.parse(request.url,true).query.appid;
		if(typeof(url.parse(request.url,true).query.timestamp)!="undefined"){
			var timestamp = url.parse(request.url,true).query.timestamp;
			if(typeof(url.parse(request.url,true).query.fileName)!="undefined"){
				var fileName = url.parse(request.url,true).query.fileName;
				if(typeof(url.parse(request.url,true).query.savePath)!="undefined"){
					var savePath = url.parse(request.url,true).query.savePath;
					//读取页面并返回
					fs.readFile('./html/newStyleUpLoad.html', function (err, data) {
						if (err){
							console.log(err);
							response.write("err"+err);
							response.end();
							}else{
								var body = data + '<script> var appid = "'+appid+'"; var timestamp = "'+timestamp+'"; var fileName = "'+fileName+'"; var savePath = "'+savePath+'";</script>';
								response.writeHead(200, {'Content-Type': 'text/html','Access-Control-Allow-Origin':'*','Cache-Control':'no-cache, no-store, must-revalidate','Pragma':'no-cache','Expires':'0'});
								response.write(body);
								response.end();	
								}
						});	
					}else{
						console.log("savePath not defined.");
						}				
				}else{
					console.log("fileName not defined.");
					}			
			}else{
				console.log("timestamp not defined.");
				}
		}else{
			console.log("appid not defined.");
			}
}


function download (response, request) {
	var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
		console.log("parsing done");
		var fileName = fields.fileName;
		console.log("fileName:"+fileName);
		var savePath = fields.savePath;
		console.log("savePath:"+savePath);
		var appid = fields.appid;
		console.log("appid:"+appid);
		var path = fields.path;
		console.log("path:"+path);		
		
		
		fs.readFile(path, function (err, data) {
				if (err){
					console.log("err:"+err);
				}else{
					console.log("reading file from:"+path+" without error");
					var body = data;
					response.writeHead(200, {'Content-Type': 'application/octet-stream'});
					response.write(body);
					response.end();					
					}
			});			
    });		
}


//去掉后缀
function delExtension(str){
	var reg = /\.\w+$/;
	return str.replace(reg,'');
	}



exports.start = start;
exports.upload = upload;
exports.uploadDoc = uploadDoc;
exports.download = download;
