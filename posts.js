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
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("posts").insertOne( {
        "user_id":req.users._id,
        "user_name":req.users.realname,
        "course_id": req.params.course_id,
        "title":req.body.title,
        "content":req.body.content,
        "timestamp":Date.now(),
        "count_read": 0,
        "count_zan":0,
        "top":false
    } );
    res.json(result);
});

router.put('/:course_id', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    var promise = req.db.collection("posts").updateOne
    (
        { "_id":ObjectId(req.body._id)},
        { $set:{ "title":req.body.title,"content":req.body.content} }
    );
    promise.then(function(updateResult) {
        console.log(updateResult);
    })
    res.json(result);
});

router.delete('/:course_id', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("posts").deleteOne( { "_id":ObjectId(req.query._id) } );
    res.json(result);
});

module.exports = router;