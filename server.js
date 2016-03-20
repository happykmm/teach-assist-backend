var fs         = require('fs');
var https      = require('https');
var express    = require('express');
var bodyParser = require('body-parser');
var CORS       = require('./router/cors');
var dbInit     = require('./db-init');
var loginCheck = require('./router/login-check');
var login      = require('./router/login');
var courses    = require('./router/courses');
var posts      = require('./router/posts');
var homework   = require("./router/homework");
var ppt        = require("./router/ppt");
var qiniu      = require("./router/qiniu");
var replies    = require("./router/replies");
var self       = require("./router/self");
var app        = express();



app.set("jwtTokenSecret", "Happy-Christmas");

var port = process.env.PORT || 9999;
https.createServer({
    key: fs.readFileSync('certificates/server.key'),
    cert: fs.readFileSync('certificates/server.crt')
}, app).listen(port);


app.use(dbInit);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use(CORS);
app.use('/login', login);
app.use('/qiniu', qiniu);
app.use(loginCheck);
app.use('/courses', courses);
app.use('/posts', posts);
app.use('/homework', homework);
app.use('/ppt', ppt);
app.use('/self', self);

console.log('Magic happens on port '+port);
