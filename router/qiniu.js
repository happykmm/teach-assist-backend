var router = require('express')();
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');

router.post('/up', function(req, res) {
    try {
        var course_id = ObjectId(req.body.course_id);
    } catch(err) {
        res.json({code:1, desc:"Invalid course_id"});
    }
    var newRecord = {
        filename: req.body.filename,
        storename: req.body.storename,
        timestamp: moment().unix()
    };
    req.db.collection("courses")
        .findOneAndUpdate(
            {_id: course_id},
            {$addToSet: {ppt: newRecord}}
        ).then(function(updateResult) {
            //qiniu 规定格式
            res.json({code: 0, content: [newRecord]});
        }, function(err) {
            res.json({code: 1, desc: err.toString()});
        })

});


module.exports = router;