var router = require("express")();
var jwt = require('jwt-simple');
var ObjectId = require('mongodb').ObjectId;


router.all('*', function(req, res, next) {
    var token = (req.body && req.body.token)
             || (req.query && req.query.token)
             || req.headers['x-access-token'];
    if (!token) {
        res.json({code: 1, desc: "Please login first!"});
        return false;
    }
    try {
        var decoded = jwt.decode(token, req.app.get('jwtTokenSecret'));
        console.log("jwt decoded: ");
        console.log(decoded);
        if (decoded.exp <= Date.now()) {
            res.json({code: 3, desc: "Session expired, please login again"});
            return false;
        } else {
            req.db.collection("users").find({
                _id: ObjectId(decoded.iss)
            }).toArray().then(function(users) {
                if (users.length > 0) {
                    req.users = {
                        _id: users[0]._id,
                        type: users[0].type,
                        number: users[0].number,
                        realname: users[0].realname,
                        intro: users[0].intro,
                        courses: users[0].courses || []
                    };
                    next();
                } else {
                    res.json({code:5, desc:"User not exist, please login again"});
                    return false;
                }
            }, function(err) {
                res.json({code:4, desc: err.toString()});
                return false;
            })
        }
    } catch (err) {
        console.log("jwt decode error: ");
        console.log(err);
        res.json({code: 2, desc: "Invalid credential!"});
        return false;
    }
});



module.exports = router;