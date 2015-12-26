var fs         = require('fs');
var https      = require('https');
var express    = require('express');
var bodyParser = require('body-parser');
var dbInit     = require('./db-init');
var loginCheck = require('./login-check');
var login      = require('./login');
var courses    = require('./courses');
var posts      = require('./posts');
var homework   = require("./homework");
var app        = express();

https.createServer({
    key: fs.readFileSync('certificates/server.key'),
    cert: fs.readFileSync('certificates/server.crt')
}, app).listen(55555);

app.use(dbInit);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use('/login', login);
app.use(loginCheck);
app.use('/courses', courses);
app.use('/posts', posts);
app.use('/homework', homework);


console.log('Magic happens on port 55555');
