var router = require("express")();
var ObjectId = require('mongodb').ObjectId;
var md5 = require('md5');

//---------------------防止越权------------------------
router.all('/:_id/*', function(req, res, next) {
    var isMatch = false;
    req.users.courses.forEach(function(course_id) {
        if (course_id.equals(req.params._id)) {
            isMatch = true;
            return false;
        }
    });
    if (!isMatch) {
        res.json({code:1, desc:"Permission denied!"});
        return false;
    }
    next();
});


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
    if (req.users.type !== "teacher") {
        res.json({code:1, desc:"Permission denied"});
    }
    var course_id = ObjectId(req.params._id);
    var students = req.body.students;
    if (typeof students !== "object") {
        res.json({code:1, desc:"Illegal parameters!"});
    }
    var result = {code:0, desc:"success!", students: []};
    var todoCount = students.length;
    function todoMinus() {
        todoCount--;
        if (todoCount === 0) {
            res.json(result);
        }
    }
    students.forEach(function(number) {
        req.db.collection("users").findOneAndUpdate(
            { "number" : number },
            { $addToSet:{"courses": course_id} }
        ).then(function(updateResult) {
            if (updateResult.value !== null) {
                result.students.push({
                    _id: updateResult.value._id,
                    number: updateResult.value.number,
                    realname: updateResult.value.realname
                });
                todoMinus();
                return;
            }
            req.db.collection("users").insertOne({
                type: "student",
                number: number,
                password: md5(number.slice(-4)),
                courses: [ course_id ]
            }).then(function(insertResult) {
                var newStudent = insertResult.ops[0];
                result.students.push({
                    _id: newStudent._id,
                    number: newStudent.number,
                    realname: newStudent.realname
                });
                todoMinus();
            }, function(err) {
                res.json({code:1, desc:err.toString()});
            })
        }, function(err) {
            res.json({code:1, desc:err.toString()});
        });
    });

});

//----------------------删除学生------------------------
router.delete('/:_id/students', function(req, res) {
    if (req.users.type !== "teacher") {
        res.json({code: 1, desc: "Permission denied!"});
        return false;
    }
    var course_id = ObjectId(req.params._id);
    var students = req.query.students;
    if (typeof students === "string")
        students = [students];
    if (typeof students !== "object") {
        res.json({code: 1, desc: "Illegal parameters!"});
        return false;
    }
    students = students.map(function(_id) {
        return ObjectId(_id);
    });
    req.db.collection("users").
        updateMany(
            { _id: {$in: students}, type:"student" },
            { $pull: {courses: course_id}}
        ).then(function(result) {
            res.json({
                code: 0,
                desc: "success",
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            })
        }, function(err) {
            res.json({code: 1, desc: err.toString()});
        });
});

//----------------------显示学生------------------------
router.get('/:_id/students', function(req, res) {
    var course_id = ObjectId(req.params._id);
    req.db.collection("users").
        find(
            { courses: course_id, type: "student"},
            { _id: 1, number: 1, realname: 1 }
        ).toArray().then(function(docs) {
            res.json({code: 0, desc: "success!", students: docs});
        }, function(err) {
            res.json({code: 1, desc: err.toString()})
        });
});

module.exports = router;