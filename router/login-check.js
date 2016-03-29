var router = require("express")();
var jwt = require('jwt-simple');
var ObjectId = require('mongoose').Types.ObjectId;
var userModel = require('../model/user');

router.all('*', function(req, res, next) {
    var token = (req.body && req.body.token)
             || (req.query && req.query.token)
             || req.headers['x-access-token'];
    if (!token) return next("请先登录！");
    try {
        var decoded = jwt.decode(token, req.app.get('jwtTokenSecret'));
    } catch (err) {
        next(err);
    }
    if (decoded.exp <= Date.now()) return next("身份过期，请重新登录！");
    userModel.findOne({
        _id: ObjectId(decoded.iss)
    }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next("身份无效，请重新登录！");
        req.users = {
            _id: user._id,
            type: user.type,
            number: user.number,
            realname: user.realname,
            intro: user.intro,
            courses: user.courses
        };
        next();
    });

});

module.exports = router;