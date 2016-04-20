var morgan = require('morgan');
var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var moment = require('moment');

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

morgan.token('x-forwarded-for', function(req) {
    return req.get('X-Forwarded-For');
});

morgan.token('date-time', function() {
    return moment().format('YYYY/MM/DD HH:mm:ss.SSS');
});

var logger = morgan('[:date-time] :x-forwarded-for ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {stream: stream});

module.exports = logger;
