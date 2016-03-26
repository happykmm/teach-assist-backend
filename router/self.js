var router = require("express")();
var userModel = require("../model/user");

router.get('/', function(req, res) {
    res.json({code:0, intro: req.users.intro});
});

router.put('/', function(req, res, next) {
    userModel.update({
        _id: req.users._id
    }, {
        $set: {intro: req.body.intro}
    }, function(err, result) {
        if (err) return next(err);
        // result === {ok: 1, nModified: 1, n:1}
        res.json({code: 0});
    });
});

module.exports = router;