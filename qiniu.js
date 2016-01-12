var router = require('express')();
var ObjectId = require('mongodb').ObjectId;
var moment = require('moment');

router.post('/up', function(req, res) {
    try {
        var course_id = ObjectId(req.body.course_id);
    } catch(err) {
        res.json({code:1, desc:"Invalid course_id"});
    }
    req.db.collection("courses")
        .findOneAndUpdate(
            {_id: course_id},
            {$addToSet: {ppt: {
                filename: req.body.filename,
                storename: req.body.storename,
                timestamp: moment().unix()
            }}}
        ).then(function(updateResult) {
            console.log(updateResult);
            res.json({
                code: 0,
                name: req.body.name
            });
        }, function(err) {
            res.json({code:1, desc:err.toString()});
        })

});


module.exports = router;