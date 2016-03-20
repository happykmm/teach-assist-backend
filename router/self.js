var router = require("express")();
var userModel = require("../model/user");

router.get('/', function(req, res) {
    res.json({code:0, intro: req.users.intro});
});

router.put('/', function(req, res) {
    req.db.collection("users")
        .updateOne(
            {_id: req.users._id},
            {$set: {intro: req.body.intro}}
        ).then(function() {
            res.json({code:0});
        }, function(err) {
            res.json({code:1, desc:err.toString()});
        })

});

module.exports = router;