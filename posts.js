/**
 * Created by WC on 2015/12/21.
 */
/**
 *  req.params.course_id
 */
var router = require("express")();
var ObjectId = require('mongodb').ObjectId;

router.get('/:course_id', function(req, res) {
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    var cursor = req.db.collection("posts").find( { course_id:req.params.course_id} );
    cursor.each(function(err, doc) {
        if (err === null) {
            if (doc !== null) {
                result.content.push(doc);
            } else {
                res.json(result);
            }
        } else {
            result.code = 1;
            result.desc = err.toString();
            res.json(result);
            return false;
        }
    });
});


router.post('/:course_id', function(req, res) {
    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    var course_id = req.params.course_id;
    var title = req.body.title;
    var content = req.body.content;
    var timestamp = Date.now();
    var parent = 0;
    var count_read = 0;
    var count_zan = 0;
    var top = req.body.top;
    var result = {
        code: 0,
        desc: "success!",
        content:[]
    };
    if(title===null || content ===null)
    {
        result.code = 1;
        result.desc = "There is no title or no content!";
        res.json(result);
    }
    else{
        req.db.collection("posts").insertOne( { "user_id":user_id,"user_name":user_name,
            "course_id":course_id,"title":title,"content":content,"timestamp":timestamp,"parent":parent,
            "count_read":count_read,"count_zan":count_zan,"top":top}).then(function(insertResult){
            var newpost = insertResult.ops[0];
            result.content.push({
                _id: newpost._id,
                user_id: newpost.user_id,
                user_name: newpost.user_name,
                course_id: newpost.course_id,
                title: newpost.title,
                content: newpost.content,
                timestamp:newpost.timestamp,
                parent:newpost.parent,
                count_read:newpost.count_read,
                count_zan:newpost.count_zan,
                top:newpost.top
            })
        });
        res.json(result);
    }
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