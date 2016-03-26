/**
 * Created by wc on 2015/12/24.
 */
var router = require("express")();
var ObjectId = require('mongoose').Types.ObjectId;


//-----------------------获取某课程某帖子的所有回复------------------------------
router.get('/:course_id/:post_id',function(req,res){
    var result = {
        code: 0,
        desc: "success",
        content: []
    };
    var cursor = req.db.collection("posts").find( { course_id:req.params.course_id, post_id:req.params.post_id} );
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


//-----------------------存储回复post_id号帖子---------------------------------------
router.post('/:course_id/:post_id',function(req,res){
    var result = {
        code: 0,
        desc: "success!"
    };
    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    var course_id = req.params.course_id;
    var title = null;
    var content = req.body.content;
    var timestamp = Date.now();
    var parent = req.params.post_id;
    var count_read = 0;
    var count_zan = 0;
    var top = 0;
    if(content===null)
    {
        result.code = 1;
        result.desc = "There is no content!";
        res.json(result);
    }
    else{
        req.db.collection("posts").insertOne( { "user_id":user_id,"user_name":user_name,
            "course_id":course_id,"title":title,"content":content,"timestamp":timestamp,
            "parent":parent,"count_read":count_read,"count_zan":count_zan,"top":top} ).then(function(insertResult){
            var newpost = insertResult.ops[0];
            result.content.push({
                _id: newpost._id,
                user_id: newpost.user_id,
                user_name: newpost.user_name,
                course_id: newpost.course_id,
                title: newpost.title,
                content: newpost.content,
                tiuemstamp:newpost.timestamp,
                parent:newpost.parent,
                count_read:newpost.count_read,
                count_zan:newpost.count_zan,
                top:newpost.top
            })
        });
        res.json(result);
    }
});


//-----------------------修改post_id号帖子的一个回复-----------------------------
router.put('/:course_id/:post_id',function(req,res){
    var result = {
        code: 0,
        desc: "success!"
    };
    var course_id = req.params.course_id;
    var newtitle = req.body.title;
    var newcontent = req.body.content;
    if(newcontent===null)
    {
        result.code = 1;
        result.desc = "There is no update content!";
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


//-----------------------删除post_id号的帖子的一个回复---------------------------
router.delete('/:course_id/:post_id',function(req,res){
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