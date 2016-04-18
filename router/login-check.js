var router = require("express")();
var jwt = require('jwt-simple');
var ObjectId = require('mongoose').Types.ObjectId;
var userModel = require('../model/user');
var config = require('../config');

router.get('*', check);
router.post('*', check);
router.put('*', check);
router.delete('*', check);

function check(req, res, next) {
    var token = (req.body && req.body.token)
        || (req.query && req.query.token)
        || req.headers['x-access-token'];
    if (!token) return res.status(401).send();
    try {
        var decoded = jwt.decode(token, config.jwtTokenSecret);
    } catch (err) {
        next(err);
    }
    if (decoded.exp <= Date.now()) return res.status(401).send();
    userModel.findOne({
        _id: ObjectId(decoded.iss)
    }).exec(function(err, user) {
        if (err) return next(err);
        if (!user) return res.status(401).send();
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
}

module.exports = router;