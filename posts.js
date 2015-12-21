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
    var count_read = req.body.count_read;
    var count_zan = req.body.zan;
    var top = req.body.top;
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("posts").insertOne( { "user_id":user_id,"user_name":user_name,
        "course_id":course_id,"title":title,"content":content,"timestamp":timestamp,
        "count_read":count_read,"count_zan":count_zan,"top":top} );
    res.json(result);
});

router.put('/:course_id', function(req, res) {
    var id = req.body.id;
    var newtitle = req.body.title;
    var newcontent = req.body.content;
    var result = {
        code: 0,
        desc: "success!"
    };
    var promise = req.db.collection("posts").updateOne
    (
        { "_id":ObjectId(id)},
        { $set:{ "title":newtitle,"content":newcontent} }
    );
    promise.then(function(updateResult) {
        console.log(updateResult);
    })
    res.json(result);
});

router.delete('/:course_id', function(req, res) {
    var id=req.query.id;
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("posts").deleteOne( { "_id":ObjectId(req.query.id) } );
    res.json(result);
});


module.exports = router;