var router = require("express")();
var qiniu = require('qiniu');
var ObjectId = require('mongoose').Types.ObjectId;
var courseModel = require('../model/course');


qiniu.conf.ACCESS_KEY = "9aJS9z4k3tz1-YWmcW2BnZr6imrVJeIo8gffioMY";
qiniu.conf.SECRET_KEY = "CJTmK6SY0DgiUsKjashWvp1z-Iob9pTlnWhYGt-L";

router.get('/token', function(req, res) {
    var putPolicy = new qiniu.rs.PutPolicy("tasystem");
    //putPolicy.expires = 3600;
    putPolicy.callbackUrl = "https://teachassist.xyz/api/qiniu/up";
    putPolicy.callbackBody = "filename=$(fname)&storename=$(key)&course_id=$(x:course_id)";
    res.json({code:0, token:putPolicy.token()});
});

router.get('/:course_id', function(req, res, next) {
    try {
        var course_id = ObjectId(req.params.course_id);
    } catch(err) {
        res.json({code:1, desc:"Invalid course id!"});
    }
    courseModel.
        findOne({_id: course_id}).
        select({ppt: true}).
        exec(function(err, course) {
            if (err) return next(err);
            res.json({code: 0, ppts: course.ppt});

        });
});


router.delete('/:course_id', function(req, res) {
    try {
        var course_id = ObjectId(req.params.course_id);
    } catch(err) {
        res.json({code:1, desc:"Invalid course id!"});
    }
    req.db.collection("courses")
        .updateOne(
            {_id: course_id},
            {$pull: {ppt: {storename: req.query.storename}}}
        ).then(function(updateResult){
            console.log(updateResult);
            res.json({code:0});
        }, function(err){
            res.json({code:1, desc:err.toString()});
        })
});

module.exports = router;
