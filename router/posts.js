
var router = require("express")();
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');

router.get('/:course_id', function(req, res) {
    try {
        var course_id = ObjectId(req.params.course_id);
    } catch(err) {
        res.json({code:1, desc:"Invalid course id!"});
        return false;
    }
    req.db.collection("posts")
        .find({course_id: course_id})
        .toArray().then(function(findResult) {
            res.json({code:0, posts:findResult});
        }, function(err) {
            res.json({code:1, desc: err.toString()});
        });
});


router.post('/:course_id', function(req, res) {
    try {
        var course_id = ObjectId(req.params.course_id);
    } catch(err) {
        res.json({code:1, desc: "Invalid course id!"});
    }
    var title = req.body.title;
    var content = req.body.content;
    if (!title || !content) {
        res.json({code:2, desc:"Incomplete parameters"});
        return false;
    }
    var newRecord = {
        "user_id": req.users._id,
        "user_name": req.users.realname,
        "course_id": course_id,
        "title": title,
        "content": content,
        "timestamp": moment().unix(),
        "parent": 0,
        "count_read": 0,
        "count_zan": 0,
        "top": 0
    };
    req.db.collection("posts")
        .insertOne( newRecord )
        .then(function(insertResult){
            var newPost = insertResult.ops;
            console.log(newPost);
            res.json({code:0, posts: newPost})
    });
});

router.put('/:course_id', function(req, res) {
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
});

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