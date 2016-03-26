var router = require("express")();
var ObjectId = require('mongoose').Types.ObjectId;

//----------------------新增作业------------------------
router.post('/:course_id', function(req, res) {
    if (req.users.type !== "teacher") {
        res.json({code: 1, desc: "Permission denied!"});
        return false;
    }
    var title = req.body.title;
    var problem = req.body.problem;
    var deadline = req.body.deadline;
    var strict = !!req.body.strict;
    if (!title || !problem || !deadline) {
        res.json({code: 1, desc: "Invalid parameters"});
        return false;
    }
    req.db.collection("homework")
        .insertOne( { title: title, problem: problem, deadline: deadline, strict: strict } )
        .then(function(insertResult) {
            console.log(insertResult);
            req.db.collection("courses").updateOne(
                { _id: ObjectId(req.params.course_id) },
                { $addToSet:{homework: insertResult.insertedId} }
            ).then(function(updateResult) {
                    res.json({code: 0, content: insertResult.ops});
                }, function(err) {
                    res.json({code: 1, desc: err.toString()});
                });
        }, function(err) {
            res.json({code: 1, desc: err.toString()});
        });
});

//----------------------显示作业------------------------
router.get('/:course_id', function(req, res) {
    try {
        var course_id = ObjectId(req.params.course_id);
    } catch(err) {
        res.json({code:1, desc:"Invalid course id!"});
    }
    req.db.collection("courses")
        .find( { _id: course_id } )
        .toArray().then(function(courses) {
            var homeworkIds = courses[0].homework;
            req.db.collection("homework")
                .find( { _id: { $in : homeworkIds } } )
                .toArray().then(function(homework) {
                    res.json({code:0, desc:"success", homework:homework});
                }, function(err) {
                    res.json({code:1, desc:err.toString()});
                })
        }, function(err) {
            res.json({code:1, desc:err.toString()});
        });
});

//----------------------删除作业------------------------
router.delete('/:course_id', function(req, res) {
    if (req.users.type !== "teacher") {
        res.json({code:1, desc:'Permission denied!'});
        return false;
    }
    try {
        var course_id = ObjectId(req.params.course_id);
        var homework_id = ObjectId(req.query.homework_id);
    } catch(err) {
        res.json({code:1, desc:"Invalid parameters!"});
    }

    req.db.collection("courses")
        .updateOne(
            { "_id": course_id },
            { $pull: {"homework":homework_id} }
        ).then(function (deleteResult) {
            if (deleteResult.modifiedCount>0) {
                req.db.collection("homework")
                    .deleteOne( { "_id":homework_id } );
            }
            res.json({code: 0});
        }, function(err) {
            res.json({code:1, desc:err.toString()});
        })
});

//----------------------更新作业------------------------
router.put('/:course_id', function(req, res) {
    var homework_id = ObjectId(req.body._id);
    var title = req.body.title;
    var problem = req.body.problem;
    var deadline = req.body.deadline;
    var result = {
        code: 0,
        desc: "success!"
    };
    if (req.users.type === "teacher")
    {
        if (title !== null)
            req.db.collection("homework").updateOne
            (
                { "_id": homework_id },
                { $set:{ "title":title } }
            );
        if (problem !== null)
            req.db.collection("homework").updateOne
            (
                { "_id": homework_id },
                { $set:{ "problem":problem } }
            );
        if (deadline !== null)
            req.db.collection("homework").updateOne
            (
                { "_id": homework_id },
                { $set:{ "deadline":deadline } }
            );
        res.json(result);
    } else {
        result.code = 1;
        result.desc = "You don't have the right to update the homework!";
        res.json(result);
    }
});

//-----------------学生显示题目--老师显示学生答案------------------
router.get('/:course_id/:homework_id', function(req, res) {
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    if (req.users.type === "teacher")
    {
        var course_id = ObjectId(req.params.course_id);
        var homework_id = ObjectId(req.params.homework_id);
        var cursor = req.db.collection("submits").find( { "course_id" : course_id, "homework_id" : homework_id } );
        cursor.count(function(submitCount) {
            cursor.each(function(err, doc) {
                if (err === null) {
                    if (doc !== null) {
                        var student_id = doc.student_id;
                        var cursorr = req.db.collection("users").find( { _id:ObjectId(student_id) } );
                        cursorr.each(function(errr, docc) {
                            if (errr === null) {
                                if (docc !== null) {
                                    //result.content.push(docc.number);
                                    //result.content.push(docc.realname);
                                    doc.realname = docc.realname;
                                    doc.number = docc.number;
                                } else {
                                    result.content.push(doc);
                                    submitCount--;
                                    if (submitCount===0)
                                        res.json(result);
                                }
                            } else {
                                result.code = 1;
                                result.desc = errr.toString();
                                res.json(result);
                                return false;
                            }
                        });
                    }
                } else {
                    result.code = 1;
                    result.desc = err.toString();
                    res.json(result);
                    return false;
                }
            });
        })
    } else {
        cursor = req.db.collection("homework").find( { _id:ObjectId(req.params.homework_id) } );
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
    }
});

//router.get('/:course_id/:homework_id', function(req, res) {
//    var result = {
//        code: 0,
//        desc: "success!",
//        content: []
//    };
//    if (req.users.type === "teacher")
//    {
//        var course_id = ObjectId(req.params.course_id);
//        var homework_id = ObjectId(req.params.homework_id);
//        var cursor = req.db.collection("submits").find( { "course_id" : course_id, "homework_id" : homework_id } );
//        cursor.each(function(err, doc) {
//            if (err === null) {
//                if (doc !== null) {
//                    var student_id = doc.student_id;
//                    var cursorr = req.db.collection("users").find( { _id:ObjectId(student_id) } );
//                    cursorr.each(function(errr, docc) {
//                        if (errr === null) {
//                            if (docc !== null) {
//                                result.content.push(docc.number);
//                                result.content.push(docc.realname);
//                            }
//                        } else {
//                            result.code = 1;
//                            result.desc = errr.toString();
//                            res.json(result);
//                            return false;
//                        }
//                    });
//                    result.content.push(doc);
//                } else {
//                    res.json(result);
//                }
//            } else {
//                result.code = 1;
//                result.desc = err.toString();
//                res.json(result);
//                return false;
//            }
//        });
//    } else {
//        cursor = req.db.collection("homework").find( { _id:ObjectId(req.params.homework_id) } );
//        cursor.each(function(err, doc) {
//            if (err === null) {
//                if (doc !== null) {
//                    result.content.push(doc);
//                } else {
//                    res.json(result);
//                }
//            } else {
//                result.code = 1;
//                result.desc = err.toString();
//                res.json(result);
//                return false;
//            }
//        });
//    }
//});

//-----------------学生提交答案--老师评分------------------
router.put('/:course_id/:homework_id', function(req, res) {
    var result = {
        code: 0,
        desc: "success!"
    };
    var course_id = ObjectId(req.params.course_id);
    var homework_id = ObjectId(req.params.homework_id);
    if (req.users.type === "teacher")
    {
        var student_id = ObjectId(req.body.student_id);
        var score = req.body.score;
        var comment = req.body.comment;
        req.db.collection("submits").updateOne(
            { "student_id":student_id, "homework_id":homework_id, "course_id":course_id },
            { $set:{ "score":score, "comment":comment } }
        );
        res.json(result);
    } else {
        var answer = req.body.answer;
        var timestamp = Date.now();
        var cursor = req.db.collection("submits").find(
            { "student_id":ObjectId(req.users._id),
                "homework_id":homework_id,
                "course_id":course_id
            } );
        cursor.count().then(function(count) {
            if (count === 0) {
                req.db.collection("submits").insertOne(
                    {
                        "student_id":ObjectId(req.users._id),
                        "homework_id":homework_id,
                        "course_id":course_id,
                        "answer":answer,
                        "timestamp":timestamp
                    }
                )
            } else {
                req.db.collection("submits").updateOne(
                    { "student_id":ObjectId(req.users._id), "homework_id":homework_id, "course_id":course_id },
                    { $set:{ "answer":answer,"timestamp":timestamp } }
                );
            }
        });
        res.json(result);
    }
});

module.exports = router;