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

const takePicture = function(camera, path) {
  camera.takePicture({keep: false, download: true}, function (er, data) {
    if (er) {
      return logger.write(`[${Date.now()}]: ERROR: ${er}\r\n`);
    }

    fs.writeFile(path.join(__dirname, path), data, (err) => {
      if (err) {
        logger.write(`[${Date.now()}]: ERROR: ${err}\r\n`);
      } else {
        logger.write(`[${Date.now()}]: ${path} saved\r\n`);
      }
    })    
  });
}

const main = function(camera, ts) {
  let count = 0;

  let timer = setInterval(() => {
      if (count > 720) {
        clearInterval(timer);
        logger.write(`[${Date.now()}]: finished shoot\r\n`);
        logger.close();
        return process.exit(0);
      }

      const outpath = path.join(ts, `${pad(count, 4, '0')}.jpg`);
      takePicture(camera, outpath);
      count += 1;
  }, 40000);
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
      const ts = Date.now();
      logger.write(`[${ts}]: Starting shoot\r\n`)
      main(camera, ts);
    }
  });
});