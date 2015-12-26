var router = require('express')();
var jwt = require('jwt-simple');
var moment = require('moment');
var md5 = require('md5');

router.post('/', function(req, res) {
    var password = md5(req.body.password);
    console.log("md5 passowrd: " + password);
    req.db.collection("users").find({
        number: req.body.username,
        password: md5(req.body.password)
    }).toArray().then(function(users) {
        if (users.length > 0) {
            var issuer = users[0]._id;
            var expires = moment().add(7, 'days').valueOf();
            var token = jwt.encode({
                iss: issuer,
                exp: expires
            }, req.app.get("jwtTokenSecret"));
            res.json({
                code: 0,
                desc: "success!",
                token: token,
                type: users[0].type,
                number: users[0].number,
                realname: users[0].realname,
                intro: users[0].intro
            });
        } else {
            res.json({
                code: 1,
                desc: "Login failed!"
            });
        }
    }, function(err) {
        res.json({
            code: 1,
            desc: err.toString()
        })
    });


});

module.exports = router;