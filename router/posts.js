var router = require("express")();
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');
var postModel = require('../model/post');

router.get('/:course_id', function(req, res, next) {
    try {
        postModel.find({
            course_id: ObjectId(req.params.course_id)
        }).exec(function(err, posts) {
            if (err) return next(err);
            res.json({code: 0, posts: posts});
        });
    } catch(err) {
        res.json({code:1, desc:"课程号错误，请重试!"});
        return false;
    }
});


router.post('/:course_id', function(req, res, next) {
    try {
        var course_id = ObjectId(req.params.course_id);
    } catch(err) {
        res.json({code:1, desc: "课程号错误，请重试！"});
    }
    var title = req.body.title;
    var content = req.body.content;
    if (!title || !content) return res.json({
        code:2, desc: "帖子内容不能为空！"
    });

    postModel.create({
        user_id: req.users._id,
        user_name: req.users.realname,
        course_id: course_id,
        title: title,
        content: content
    }, function(err, post) {
        if (err) return next(err);
        console.log(post);

    })


    req.db.collection("posts")
        .insertOne( newRecord )
        .then(function(insertResult){
            var newPost = insertResult.ops;
            console.log(newPost);
            res.json({code:0, posts: newPost})
    });
});

/*router.put('/:course_id', function(req, res) {
    var course_id = req.body.course_id;
    var newtitle = req.body.title;
    var newcontent = req.body.content;
    var result = {
        code: 0,
        desc: "success!"
    };
    if(newtitle===null || newcontent ===null)
    {
        result.code = 1;
        result.desc = "There is no update title or no update content!";
        res.json(result);
    }
    else{
        var promise = req.db.collection("posts").updateOne
        (
            { "_id":ObjectId(course_id)},
            { $set:{ "title":newtitle,"content":newcontent} }
        );
    }
    res.json(result);
});*/

router.delete('/:course_id', function(req, res) {
    var id=req.query.post_id;
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("posts").deleteOne( { "_id":ObjectId(req.query.post_id) }).
        then(function(err)
            {res.json({code:1, desc:err.toString()})}
    );
    res.json(result);
});

module.exports = router;