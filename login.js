var router = require('express')();
var jwt = require('jsonwebtoken');
var moment = require('moment');

router.post('/', function(req, res) {
    req.db.collection("users").find({
        number: req.body.username,
        password: req.body.password
    }).toArray().then(function(docs) {
        if (docs.length > 0) {
            var user = docs[0];
            var expires = moment().add(7, 'days').valueOf();
            console.log(expires);
            console.log(jwt);
            var token = jwt.encode({
                _id: user._id,
                expires: expires
            });

            //req.db.collection("users").updateOne(
            //    { _id: user._id },
            //    { token: token, expires: expires }
            //);
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