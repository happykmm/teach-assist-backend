var router = require('express')();
var jwt = require('jwt-simple');
var moment = require('moment');
var encrypt = require('../helper/encrypt');
var userModel = require('../model/user');


router.post('/', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    password = encrypt(username, password);
    console.log("encrypt password: " + password);
    userModel.
        findOne({
            number: username,
            password: password
        }).
        select({_id:1, type:1, number:1, realname:1}).
        exec(function (err, user) {
            if (err)  return next(err);
            if (!user)  return res.json({
                code: 1,
                desc: "用户名和密码不匹配！"
            });
            var token = jwt.encode({
                iss: user._id,
                exp: moment().add(7, 'days').valueOf()
            }, req.app.get("jwtTokenSecret"));
            console.log(user);
            res.json({
                code: 0,
                token: token,
                type: user.type,
                number: user.number,
                realname: user.realname
            });
        });
});

module.exports = router;