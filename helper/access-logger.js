var morgan = require('morgan');
var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');

var logDir = appRoot + '/log';
fs.existsSync(logDir) || fs.mkdirSync(logDir);

var stream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDir + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
});

morgan.token('real-ip', function(req) {
    console.log(req.get('X-Real-Ip'));
    return req.get('X-Real-Ip');
});

var logger = morgan(':real-ip', {stream: stream});

module.exports = logger;