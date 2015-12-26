var router = require('express')();
var jwt = require('jwt-simple');
var moment = require('moment');


router.post('/', function(req, res) {
    req.db.collection("users").find({
        number: req.body.username,
        password: req.body.password
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
                token: token
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