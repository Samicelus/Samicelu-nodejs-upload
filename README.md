# Samicelu-nodejs-upload
nodejs-upload modified by samicelus, using this with Samicelus-ctrl
This version is created based on billfeller's nodejs-upload-image-demo:
[billfeller's nodejs-upload-image-demo](https://github.com/billfeller/nodejs-upload-image-demo.git)

Install
================

Make sure that Node.js and graphicsMagick installed on your server.
* [node-v0.10.26-x64](http://pan.baidu.com/s/1i3JbpIl) -node for windows 64bit
[nodejs' official site](https://nodejs.org/en/)

Then install graphicsMagick on the target PC:
* [GraphicsMagick-1.3.23-Q16-win64-dll](http://pan.baidu.com/s/1mgxq2da) -a lite tool for image processing with command.
[GraphicsMagick's official site](http://www.graphicsmagick.org/)


Initialize
================

Edit the config.json
```js
   {
   "uploadServerPort":5901,
   "localUDPPort":7006,
   "socketManagerUDPPort":7007,
   "rootPath":"D:/productData/nodejs_upload/"
   }
```

Note that browser access the uploadservice through uploadServerPort, uploadservice inform socketManager using UDP via socketManagerUDPPort.
rootPath is the root path of this folder.
