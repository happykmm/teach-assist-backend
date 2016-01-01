var router = require("express")();
var ObjectId = require('mongodb').ObjectId;
var md5 = require('md5');

//----------------------新增课程------------------------
router.post('/', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        var name = req.body.name;
        if (name===null)
        {
            result.code = 1;
            result.desc = "Course name is empty!";
            res.json(result);
        } else {
            req.db.collection("courses")
                .insertOne( { "name":name,"intro":null,"schedule":null,"homework":[],"ppt":[] } )
                .then(function(insertResult) {
                    var _id = insertResult.insertedId;
                    req.db.collection("users").updateOne(
                        { "_id": req.users._id },
                        { $addToSet:{"courses": _id } } )
                        .then(function() {
                            req.db.collection("courses").find( { "_id": _id }).toArray()
                                .then(function(findResult){
                                    result.content = findResult;
                                    res.json(result);
                                });
                        });
                });
        }
    } else {
        result.code = 1;
        result.desc = "Permission denied";
        res.json(result);
    }
});

//----------------------显示课程------------------------
router.get('/', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("courses").
        find( { _id: { $in : req.users.courses } }).
        toArray().then(function(docs) {
            result.content = docs;
            res.json(result);
        }, function(err) {
            result.code = 1;
            result.desc = err.toString();
            res.json(result);
        });
});

//----------------------删除课程------------------------
router.delete('/', function(req, res) {
    console.log(req.query);
    var course_id = ObjectId(req.query._id);
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
                } else {
                    result.code = 1;
                    result.desc = "Can't find this course!";
                    res.json(result);
                }
            })
    } else {
        result.code = 1;
        result.desc = "Permission denied";
        res.json(result);
    }
});

//----------------------更新课程名------------------------
router.put('/', function(req, res) {
    var course_id = ObjectId(req.body._id);
    var newName = req.body.name;
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
        result.desc = "Permission denied";
        res.json(result);
    }
});

//----------------------显示课程介绍------------------------
router.get('/:_id/intro', function(req, res) {
    req.db.collection("courses").
        find( { _id:ObjectId(req.params._id) }).
        toArray().
        then(function(docs) {
            if (docs.length > 0) {
                res.json({
                    code: 0,
                    desc: "success!",
                    intro: docs[0].intro
                });
            } else {
                res.json({
                    code: 1,
                    desc: "Invalid course_id!"
                });
            }
        }, function(err) {
            res.json({
                code: 1,
                desc: err.toString()
            })
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
router.get('/:_id/sched', function(req, res) {
    req.db.collection("courses").
        find( { _id:ObjectId(req.params._id) }).
        toArray().then(function(docs) {
            if (docs.length > 0) {
                res.json({
                    code: 0,
                    desc: "success",
                    sched: docs[0].schedule
                })
            } else {
                res.json({
                    code: 1,
                    desc: "Invalid course id!"
                });
            }
        }, function(err) {
            res.json({
                code: 1,
                desc: err.toString()
            });
        });
});

//----------------------修改课程安排------------------------
router.put('/:_id/sched', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        var schedule = req.body.sched;
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
                            "password": md5(number.slice(-4)),
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
        result.desc = "Permission denied";
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
    var course_id = ObjectId(req.params._id);
    req.db.collection("users").
        find( { courses: course_id, type: "student"}).
        toArray().then(function(docs) {
            res.json({
                code: 0,
                desc: "success!",
                content: docs
            });
        }, function(err) {
            res.json({
                code: 1,
                desc: err.toString()
            })
        });
});

module.exports = router;