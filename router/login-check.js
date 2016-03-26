var router = require("express")();
var jwt = require('jwt-simple');
var ObjectId = require('mongoose').Types.ObjectId;
var userModel = require('../model/user');

router.all('*', function(req, res, next) {
    var token = (req.body && req.body.token)
             || (req.query && req.query.token)
             || req.headers['x-access-token'];
    if (!token) return res.json({
        code: 1,
        desc: "请先登录!"
    });
    try {
        var decoded = jwt.decode(token, req.app.get('jwtTokenSecret'));
        if (decoded.exp <= Date.now()) return res.json({
            code: 1,
            desc: "身份过期，请重新登录！"
        });
        userModel.findOne({
            _id: ObjectId(decoded.iss)
        }).exec(function(err, user) {
            if (err) return next(err);
            if (!user) return res.json({
                code: 1,
                desc: "身份无效，请重新登录！"
            });
            req.users = {
                _id: user._id,
                type: user.type,
                number: user.number,
                realname: user.realname,
                intro: user.intro,
                courses: user.courses || []
            };
            next();
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;