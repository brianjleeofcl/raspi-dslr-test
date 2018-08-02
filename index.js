var fs = require('fs');
var path = require('path');
var gphoto2 = require('gphoto2');
var pad = require('left-pad');
var GPhoto = new gphoto2.GPhoto2();

GPhoto.setLogLevel(1);
GPhoto.on('log', function (level, domain, message) {
  console.log(domain, message);
});

const logPath = path.join(__dirname, "operation.log");
const logger = fs.createWriteStream(logPath, {flags: 'a'});

const takePicture = function(camera, filepath) {
  camera.takePicture({keep: true, download: true}, function (er, data) {
    if (er) {
      return logger.write(`[${Date.now()}]: ERROR: ${er}\r\n`);
    }

    fs.writeFile(path.join(__dirname, filepath), data, (err) => {
      if (err) {
        logger.write(`[${Date.now()}]: ERROR: ${err}\r\n`);
      } else {
        logger.write(`[${Date.now()}]: ${filepath} saved\r\n`);
      }
    })    
  });
}

const main = function(camera, ts) {
  let count = 0;

  let timer = setInterval(() => {
      if (count > 720) {
        clearInterval(timer);
        logger.write(`[${Date.now()}]: finished shoot ${ts}\r\n`);
        logger.close();
        return process.exit(0);
      }

      const outpath = path.join(ts, `${pad(count, 4, '0')}.jpg`);
      takePicture(camera, outpath);
      count += 1;
  }, 33333);
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
      const ts = Date.now().toString();
      logger.write(`[${Date.now()}]: Starting shoot ${ts}\r\n`)
      main(camera, ts);
    }
  });
});
