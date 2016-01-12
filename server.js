var fs         = require('fs');
var https      = require('https');
var express    = require('express');
var bodyParser = require('body-parser');
var CORS       = require('./cors');
var dbInit     = require('./db-init');
var loginCheck = require('./login-check');
var login      = require('./login');
var courses    = require('./courses');
var posts      = require('./posts');
var homework   = require("./homework");
var ppt         = require("./ppt");
var replies = require("./replies");
var app        = express();



app.set("jwtTokenSecret", "Happy-Christmas");

var port = process.env.PORT || 8080;
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
app.use(loginCheck);
app.use('/courses', courses);
app.use('/posts', posts);
app.use('/homework', homework);
app.use('/ppt', ppt);


console.log('Magic happens on port '+port);
