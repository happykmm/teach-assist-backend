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

morgan.token('x-real-ip', function(req) {
    return req.get('X-Real-IP');
});

morgan.token('x-forward-for', function(req) {
    return req.get('X-Forward-For');
});

var logger = morgan(':x-real-ip :x-forward-for', {stream: stream});

module.exports = logger;