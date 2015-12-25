var express    = require('express');
var bodyParser = require('body-parser');
var dbInit = require('./db-init');
var loginCheck = require('./login-check');
var courses = require('./courses');
var posts = require('./posts');
var homework = require("./homework");

var app = express();
app.use(dbInit);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use(loginCheck);
app.use('/courses', courses);
app.use('/posts',posts);
app.use('/homework', homework);


var port = process.env.PORT || 8080;
app.listen(port);
console.log('Magic happens on port ' + port);
