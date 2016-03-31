var router = require("express")();
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');
var postModel = require('../model/post');


//---------------------防止越权------------------------
router.all('/:course_id*', function(req, res, next) {
    var isMatch = false;
    req.users.courses.forEach(function(course_id) {
        if (course_id.equals(req.params.course_id)) {
            isMatch = true;
            return false;
        }
    });
    isMatch ? next() : next("您没有访问该课程的权限!");
});


//-------------------转义课程号------------------------
router.all('/:course_id*', function(req, res, next) {
    try {
        req.params.course_id = ObjectId(req.params.course_id)
    } catch(err) {
        return next("课程号不存在！");
    }
    next();
});

//-------------------转义帖子号------------------------
router.all('/:course_id/:post_id*', function(req, res, next) {
    try {
        req.params.post_id = ObjectId(req.params.post_id)
    } catch(err) {
        return next("帖子号不存在！");
    }
    next();
});



//---------------------获取帖子列表--------------------
// {
//     "code": 0,
//     "posts": [
//     {
//         "_id": "56fd165f86ea29181b35dc0e",
//         "updatedAt": "2016-03-31T12:21:51.419Z",
//         "createdAt": "2016-03-31T12:21:51.419Z",
//         "user_id": "56957522f7b3032a3c630da9",
//         "user_name": "张泉方",
//         "top": 0,
//         "count_reply": 0,
//         "count_read": 0,
//         "content": "你用彩虹的浪漫，温柔包装",
//         "title": "彩虹",
//         "count_like": 0
//     }
// ]
// }
router.get('/:course_id', function(req, res, next) {
    postModel.find({
        course_id: req.params.course_id,
        parent: null,
        del: 0
    }, {
        __v: 0,
        course_id: 0,
        del: 0,
        parent: 0
    }).
    lean().
    exec(function(err, posts) {
        if (err) return next(err);
        posts.forEach(function(post, index) {
            post.count_like = post.like_by.length;
            delete post.like_by;
        });
        res.json({code: 0, posts: posts});
    });
});


//---------------------新增主题帖------------------------
// {
//     "code": 0,
//     "post": {
//     "updatedAt": "2016-03-31T12:36:05.287Z",
//         "createdAt": "2016-03-31T12:36:05.287Z",
//         "user_id": "56957522f7b3032a3c630da9",
//         "user_name": "张泉方",
//         "_id": "56fd19b5cd4f59341935ec3c",
//         "top": 0,
//         "count_reply": 0,
//         "count_read": 0,
//         "content": "当天空昏暗，当气温失常",
//         "title": "彩虹",
//         "count_like": 0
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
        post = post.toObject();
        delete post.__v;
        delete post.course_id;
        delete post.del;
        delete post.parent;
        delete post.like_by;
        post.count_like = 0;
        res.json({code:0, post:post});
    });      
});


//---------------------查看回复------------------------
router.get('/:course_id/:post_id', function(req, res, next) {
    postModel.find({
        course_id: req.params.course_id,
        parent: req.params.post_id,
        del: 0
    }, {
        __v: 0,
        course_id: 0,
        del: 0,
        parent: 0,
        count_read: 0,
        count_reply: 0,
        like_by: 0,
        updatedAt: 0,
        top: 0,
        title: 0
    }).exec(function(err, replies) {
        if (err) return next(err);
        res.json({code: 0, posts: replies});
        //增加阅读量，刷新回复量
        postModel.findOne({
            _id: req.params.post_id
        }, function(err, doc) {
            if (err) return next(err);
            if (!doc) return next("增加阅读量失败，id="+req.params.post_id);
            doc.count_read++;
            doc.count_reply = replies.length;
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
        title: " ",
        content: req.body.content,
        parent: req.params.post_id
    }, function(err, post) {
        if (err) return next(err);
        post = post.toObject();

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
        if (!doc.course_id.equals(req.params.course_id)) return next("该帖子不属于本课程！");
        if (!doc.user_id.equals(req.users._id)) return next("您无权编辑该帖子！");
        if (doc.del) return next("该帖子已经被删除！");
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
        _id: req.params.post_id
    }, function(err, doc) {
        if (err) return next(err);
        if (!doc) return next("该帖子不存在！");
        if (!doc.course_id.equals(req.params.course_id)) return next("该帖子不属于本课程！");
        if (!doc.user_id.equals(req.users._id)) return next("您无权删除该帖子!");
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


//-----------------置顶或取消置顶----------------------
//只能置顶主题帖，只有老师可以操作
router.put('/:course_id/:post_id/top', function(req, res, next) {
    if (req.users.type !== "teacher") return next("您没有权限置顶！");
    postModel.findOne({
        _id: req.params.post_id
    }, function(err, doc) {
        if (err) return next(err);
        if (!doc) return next("该帖子不存在！");
        if (!doc.course_id.equals(req.params.course_id)) return next("该帖子不属于本课程！");
        if (doc.del) return next("该帖子已经被删除！");
        if (doc.parent) return next("回复内容不能置顶！");
        doc.top = 1 - doc.top;
        doc.save();
        res.json({code: 0, top: doc.top});
    })
});


//-----------------点赞或取消点赞----------------------
router.put('/:course_id/:post_id/like', function (req, res, next) {
    postModel.findOne({
        _id: req.params.post_id,
        course_id: req.params.course_id,  //帖子属于本课程
        del: 0,                           //帖子没有被删除
        parent: null                      //帖子是主题帖
    }, function(err, doc) {
        if (err) return next(err);
        if (!doc) return next("该帖子不存在！");
        if (doc.like_by.id(req.users._id)) {
            doc.like_by.id(req.users._id).remove();
            res.json({code: 0, like: 0});
        } else {
            doc.like_by.push({
                _id: req.users._id,
                user_name: req.users.realname
            });
            res.json({code: 0, like: 1});
        }
        doc.save();
    });
    
});


module.exports = router;



