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

const takePicture = function(camera, count) {
  camera.takePicture({keep: true, download: false}, function (er) {
    if (er) {
      logger.write(`[${Date.now()}]: ERROR: ${er}\r\n`);
    } else {
      logger.write(`[${Date.now()}]: img #${count} saved\r\n`);
    }
  });
}

const main = function(camera) {
  let count = 0;

  let timer = setInterval(() => {
      if (count > 1200) {
        clearInterval(timer);
        logger.write(`[${Date.now()}]: finished shoot\r\n`)
        return process.exit(0);
      }

      takePicture(camera, count);
      count += 1;
  }, 30000);
}

GPhoto.list(function (list) {
  console.log('List:', list);
  if (list.length === 0) return;
  var camera = list[0];
  console.log('Found', camera.model);

  camera.getConfig(function (er) {
    if (er) {
      process.exit(1);
    }
    else {
      logger.write(`[${Date.now()}]: Starting shoot\r\n`)
      main(camera);
    }
  });
});