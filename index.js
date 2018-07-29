var fs = require('fs');
var path = require('path');
var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();

GPhoto.setLogLevel(1);
GPhoto.on('log', function (level, domain, message) {
  console.log(domain, message);
});

const logPath = path.join(__dirname, "operation.log");

const logger = fs.createWriteStream(logPath, {flags: 'a'});

const takePicture = function(camera) {
  camera.takePicture({keep: true, download: false}, function (er) {
    if (er) {
      logger.write(`[${Date.now()}]: ERROR: ${er}`)
    } else {
      logger.write(`[${Date.now()}]: img #${count} saved`)
    }
  });
}

GPhoto.list(function (list) {
  console.log('List:', list);
  if (list.length === 0) return;
  var camera = list[0];
  console.log('Found', camera.model);

  let count = 0

  let timer = setInterval(() => {
      if (count > 5) clearInterval(timer);

      takePicture(camera);
      count += 1;
  }, 6000)
});