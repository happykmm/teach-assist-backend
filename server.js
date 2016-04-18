var fs         = require('fs');
var express    = require('express');
var bodyParser = require('body-parser');
var logger     = require("morgan");

var CORS         = require('./helper/cors');
var dbInit       = require('./helper/db-init');
var errorHandler = require("./helper/error-handler");

var loginCheck = require('./router/login-check');
var login      = require('./router/login');
var courses    = require('./router/courses');
var posts      = require('./router/posts');
var homework   = require("./router/homework");
var ppt        = require("./router/ppt");
var qiniu      = require("./router/qiniu");
var self       = require("./router/self");

var config     = require("./config");
var app        = express();


app.use(dbInit);
app.use(logger());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
if (config.debug) app.use(CORS);
app.use('/login', login);
app.use('/qiniu', qiniu);
app.use(loginCheck);
app.use('/courses', courses);
app.use('/posts', posts);
app.use('/homework', homework);
app.use('/ppt', ppt);
app.use('/self', self);
app.use(errorHandler);


var port = process.env.PORT || 9999;
app.listen(port, '127.0.0.1');
console.log('Magic happens on port '+port);
