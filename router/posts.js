var router = require("express")();
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');
var postModel = require('../model/post');


//-------------------转义课程号------------------------
router.all('/:course_id', function(req, res, next) {
    try {
        req.params.course_id = ObjectId(req.params.course_id)
    } catch(err) {
        return next("课程号不存在！");
    }
    next();
});

//-------------------转义帖子号------------------------
router.all('/:course_id/:post_id', function(req, res, next) {
    try {
        req.params.post_id = ObjectId(req.params.post_id)
    } catch(err) {
        return next("帖子号不存在！");
    }
    next();
});

//---------------------防止越权------------------------
router.all('/:course_id', function(req, res, next) {
    var isMatch = false;
    req.users.courses.forEach(function(course_id) {
        if (course_id.equals(req.params.course_id)) {
            isMatch = true;
            return false;
        }
    });
    isMatch ? next() : next("您没有访问该课程的权限!");
});


//---------------------获取帖子列表--------------------
// {
//     "code": 0,
//     "posts": [ {},{},{}... ]
// }
router.get('/:course_id', function(req, res, next) {
    postModel.find({
        course_id: req.params.course_id,
        parent: null,
        del: 0
    }).exec(function(err, posts) {
        if (err) return next(err);
        res.json({code: 0, posts: posts});
    });
});


//---------------------新增主题帖------------------------
// {
//     "code": 0,
//     "post": {
//     "__v": 0,
//         "updatedAt": "2016-03-29T11:45:00.912Z",
//         "createdAt": "2016-03-29T11:45:00.912Z",
//         "user_id": "56957522f7b3032a3c630da9",
//         "user_name": "张泉方",
//         "course_id": "5682725d60ff7eac1d73edeb",
//         "title": "lalala",
//         "content": "lololo",
//         "_id": "56fa6abc3d72f19c21058da3",
//         "del": 0,
//         "top": 0,
//         "count_zan": 0,
//         "count_read": 0,
//         "parent": null
// }
// }
router.post('/:course_id', function(req, res, next) {
    if (!req.body.title) return next("帖子标题不能为空！");
    if (!req.body.content)  return next("帖子内容不能为空！");
    postModel.create({
        user_id: req.users._id,
        user_name: req.users.realname,
        course_id: req.params.course_id,
        title: req.body.title,
        content: req.body.content
    }, function(err, post) {
        if (err) return next(err);
        res.json({code:0, post:post});
    });      
});


//---------------------查看回复------------------------
router.get('/:course_id/:post_id', function(req, res, next) {
    postModel.find({
        course_id: req.params.course_id,
        parent: req.params.post_id,
        del: 0
    }).exec(function(err, posts) {
        if (err) return next(err);
        res.json({code: 0, posts: posts});
        //增加阅读量，刷新回复量
        postModel.findOne({
            _id: req.params.post_id
        }, function(err, doc) {
            if (err) return next(err);
            if (!doc) return next("增加阅读量失败，id="+req.params.post_id);
            doc.count_read++;
            doc.count_reply = posts.length;
            doc.save();
        });
    });
});


//---------------------新增回复------------------------
router.post('/:course_id/:post_id', function(req, res, next) {
    if (!req.body.content)  return next("帖子内容不能为空！");
    postModel.create({
        user_id: req.users._id,
        user_name: req.users.realname,
        course_id: req.params.course_id,
        title: "",
        content: req.body.content,
        parent: req.params.post_id
    }, function(err, post) {
        if (err) return next(err);
        res.json({code:0, post:post});
        updateCountReply(post.parent, 1);
    });
});


//---------------------编辑帖子------------------------
//只能修改自己发的主题帖，不能修改回复贴,不能修改已经被删除的帖子
router.put('/:course_id/:post_id', function(req, res, next) {
    if (!req.body.title) return next("帖子标题不能为空！");
    if (!req.body.content) return next("帖子内容不能为空！");
    postModel.findOne({
        _id: req.params.post_id
    }, function(err, doc) {
        if (err) return next(err);
        if (!doc) return next("该帖子不存在！");
        if (doc.del) return next("该帖子已经被删除！");
        if (!doc.user_id.equals(req.users._id)) return next("您无权编辑该帖子！");
        if (doc.parent) return next("回复内容不能编辑！");
        doc.title = req.body.title;
        doc.content = req.body.content;
        doc.save();
        res.json({code: 0});
    })
});


//---------------------删除帖子------------------------
//只能删除自己发的帖子
router.delete('/:course_id/:post_id', function(req, res, next) {
    postModel.findOne({
        _id: req.params.post_id,
        user_id: req.users._id
    }, function(err, doc) {
        if (err) return next(err);
        if (!doc) return next("您无权删除该帖子!");
        if (doc.del) return next("该帖子已经被删除！");
        doc.del++;
        doc.save();
        res.json({code: 0});
        if (doc.parent) updateCountReply(doc.parent, -1);
    });
});


function updateCountReply(_id, delta) {
    postModel.findOne({
        _id: _id
    }, function(err, parentDoc) {
        if (err) return console.log(err.stack);
        if (!parentDoc) return console.log("更新回复数量失败，id="+_id);
        parentDoc.count_reply += delta;
        parentDoc.save();
    });
}

module.exports = router;