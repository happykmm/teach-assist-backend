var router = require("express")();
var ObjectId = require('mongodb').ObjectId;

//----------------------新增课程------------------------
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

//----------------------显示课程------------------------
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

//----------------------删除课程------------------------
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
                if (deleteResult.modifiedCount>0)
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

//----------------------更新课程名------------------------
router.put('/', function(req, res) {
    var course_id = ObjectId(req.body._id);
    var newName=req.body.newName;
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
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

//----------------------显示课程介绍------------------------
router.get('/:_id/intro', function(req, res) {
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    var cursor = req.db.collection("courses").find( { _id:ObjectId(req.params._id) } );
    cursor.each(function(err, doc) {
        if (err === null) {
            if (doc !== null) {
                result.content.push(doc.intro);
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

//----------------------修改课程介绍------------------------
router.put('/:_id/intro', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        var intro = req.body.intro;
        req.db.collection("courses").updateOne
        (
            { "_id": ObjectId(req.params._id) },
            { $set:{ "intro":intro } }
        );
        res.json(result);
    } else {
        result.code = 1;
        result.desc = "You don't have the right to modify the introduction of the course!";
        res.json(result);
    }
});

//----------------------显示课程安排------------------------
router.get('/:_id/schedule', function(req, res) {
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    var cursor = req.db.collection("courses").find( { _id:ObjectId(req.params._id) } );
    cursor.each(function(err, doc) {
        if (err === null) {
            if (doc !== null) {
                result.content.push(doc.schedule);
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

//----------------------修改课程安排------------------------
router.put('/:_id/schedule', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        var schedule = req.body.schedule;
        req.db.collection("courses").updateOne
        (
            { "_id": ObjectId(req.params._id) },
            { $set:{ "schedule":schedule } }
        );
        res.json(result);
    } else {
        result.code = 1;
        result.desc = "You don't have the right to modify the schedule of the course!";
        res.json(result);
    }
});

//----------------------新增学生------------------------
router.post('/:_id/students', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        var students_list = req.body.students;
        var students_set = students_list.split(',');
        students_set.forEach(function(number)
        {
            var cursor = req.db.collection("users").find( { "number" : number } );
            cursor.count().then(function(count) {
                if (count === 0) {
                    req.db.collection("users").insertOne(
                        {
                            "type": "student",
                            "number": number,
                            "password": number.slice(-4),
                            "courses": [ObjectId(req.params._id)]
                        }
                    )
                } else {
                    req.db.collection("users").updateOne(
                        { "number" : number },
                        { $addToSet:{"courses":ObjectId(req.params._id)} }
                    );
                }
            });
        });
        res.json(result);
    } else {
        result.code = 1;
        result.desc = "You don't have the right to add students to this course!";
        res.json(result);
    }
});

//----------------------删除学生------------------------
router.delete('/:_id/students', function(req, res) {
    var course_id = ObjectId(req.params._id);
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        var cursor = req.db.collection("users").find( { "courses" : {$in:[course_id]} } );
        cursor.each(function(err, doc) {
            if (err === null) {
                if (doc !== null) {
                    if (doc.type === "student") {
                        req.db.collection("users").updateOne(
                            { "_id": ObjectId(doc._id) },
                            { $pull:{"courses":course_id} }
                        )
                    }
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
    } else {
        result.code = 1;
        result.desc = "You don't have the right to delete students from this course!";
        res.json(result);
    }
});

//----------------------显示学生------------------------
router.get('/:_id/students', function(req, res) {
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    var course_id = ObjectId(req.params._id);
    var cursor = req.db.collection("users").find( { "courses" : {$in:[course_id]} } );
    cursor.each(function(err, doc) {
        if (err === null) {
            if (doc !== null) {
                if (doc.type === "student") {
                    result.content.push(doc.number);
                    result.content.push(doc.realname);
                }
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

module.exports = router;