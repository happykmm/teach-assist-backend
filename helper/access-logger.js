var logger = require('morgan');
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


module.exports = logger('combined', {stream: stream});