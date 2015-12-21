var router = require("express")();
var ObjectId = require('mongodb').ObjectId;

router.post('/', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        var name = req.body.name;
        req.db.collection("courses")
            .insertOne( { "name":name } )
            .then(function(insertResult) {
                req.db.collection("users").updateOne(
                    { "_id": req.users._id },
                    { $addToSet:{"courses":insertResult.insertedId} }
                );
                res.json(result);
            });
    } else {
        result.code = 1;
        result.desc = "You don't have the right to add the course!";
        res.json(result);
    }
});

router.get('/', function(req, res) {
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    var cursor = req.db.collection("courses").find( { _id: { $in : req.users.courses } } );
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

router.delete('/', function(req, res) {
    var course_id = ObjectId(req.query.course_id);
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        req.db.collection("users")
            .updateOne(
            { "_id": req.users._id },
            { $pull:{"courses":course_id} }
            )
            .then(function (deleteResult) {
                if (deleteResult.deletedCount>0)
                {
                    req.db.collection("courses").deleteOne( { "_id":course_id } );
                    res.json(result);
                }
            })
    } else {
        result.code = 1;
        result.desc = "You don't have the right to delete the course!";
        res.json(result);
    }
});

router.put('/', function(req, res) {
    var course_id = ObjectId(req.body._id);
    var newName=req.body.newName;
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        console.log(req.users.type);
        req.db.collection("courses").updateOne
        (
            { "_id": course_id },
            { $set:{ "name":newName } }
        );
        res.json(result);
    } else {
        result.code = 1;
        result.desc = "You don't have the right to update the course!";
        res.json(result);
    }
});

module.exports = router;