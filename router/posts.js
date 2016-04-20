var router = require("express")();
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');
var postModel = require('../model/post');


//---------------------防止越权------------------------
router.all('/:courseId*', function(req, res, next) {
    var isMatch = false;
    req.users.courses.forEach(function(courseId) {
        if (courseId.equals(req.params.courseId)) {
            isMatch = true;
            return false;
        }
    });
    isMatch ? next() : next("您没有访问该课程的权限!");
});


//-------------------转义课程号------------------------
router.all('/:courseId*', function(req, res, next) {
    try {
        req.params.courseId = ObjectId(req.params.courseId)
    } catch(err) {
        return next("课程号不存在！");
    }
    next();
});

//-------------------转义帖子号------------------------
router.all('/:courseId/:postId*', function(req, res, next) {
    try {
        req.params.postId = ObjectId(req.params.postId)
    } catch(err) {
        return next("帖子号不存在！");
    }
    next();
});



//---------------------获取主题帖列表--------------------
// {
//     "code": 0,
//     "posts": [
//     {
//         "_id": "56fd270825a1f4841c685265",
//         "updatedAt": "2016-03-31T13:32:56.622Z",
//         "createdAt": "2016-03-31T13:32:56.622Z",
//         "userId": "56957522f7b3032a3c630da9",
//         "userName": "张泉方",
//         "isTop": 0,
//         "countReply": 0,
//         "countLike": 0,
//         "countRead": 0,
//         "content": "好听好听！！！",
//         "title": "彩虹"
//     }
// ]
// }
router.get('/:courseId', function(req, res, next) {
    postModel.find({
        courseId: req.params.courseId,
        isDel: 0
    }, {
        __v: 0,
        courseId: 0,
        isDel: 0,
        reply: 0,
        likeBy: 0
    }).
    exec(function(err, posts) {
        if (err) return next(err);
        res.json({code: 0, posts: posts});
    });
});


//---------------------新增主题帖------------------------
// {
//     "code": 0,
//     "post": {
//         "updatedAt": "2016-04-01T02:45:29.044Z",
//         "createdAt": "2016-04-01T02:45:29.044Z",
//         "userId": "56957522f7b3032a3c630da9",
//         "userName": "张泉方",
//         "_id": "56fde0c959a6aa5824b895ef",
//         "isTop": 0,
//         "countReply": 0,
//         "countLike": 0,
//         "countRead": 0,
//         "content": "菊花残，满地伤，你的笑容已泛黄",
//         "title": "菊花残"
// }
// }
router.post('/:courseId', function(req, res, next) {
    if (!req.body.title) return next("帖子标题不能为空！");
    if (!req.body.content)  return next("帖子内容不能为空！");
    postModel.create({
        userId: req.users._id,
        userName: req.users.realname,
        courseId: req.params.courseId,
        title: req.body.title,
        content: req.body.content
    }, function(err, post) {
        if (err) return next(err);
        post = post.toObject();
        delete post.__v;
        delete post.courseId;
        delete post.isDel;
        delete post.likeBy;
        delete post.reply;
        res.json({code:0, post:post});
    });      
});


//--------------查看主题帖详情（阅读量，赞，回复）----------------
router.get('/:courseId/:postId', function(req, res, next) {
    postModel.findOne({
        _id: req.params.postId,
        courseId: req.params.courseId,
        isDel: 0
    }, {
        __v: 0,
        courseId: 0,
        isDel: 0
    }).exec(function(err, post) {
        if (err) return next(err);
        if (!post) return next("帖子不存在");
        post.countRead++;
        post.countLike = post.likeBy.length;
        var postObj = post.toObject();
        postObj.isLike = post.likeBy.id(req.users._id) ? 1 : 0;
        postObj.reply = postObj.reply.filter(function(reply) {
            var isShow = !reply.isDel;
            delete reply.isDel;
            return isShow;
        });
        console.log(postObj);
        post.countReply = postObj.countReply = postObj.reply.length;
        post.save();
        res.json({code: 0, post: postObj});
    });
});


//---------------------新增回复------------------------
router.post('/:courseId/:postId', function(req, res, next) {
    if (!req.body.content)  return next("帖子内容不能为空！");
    postModel.findOne({
        _id: req.params.postId,
        courseId: req.params.courseId,
        isDel: 0
    }).exec(function(err, post) {
        if (err) return next(err);
        if (!post) return next("帖子不存在");
        post.reply.push({
            userId: req.users._id,
            userName: req.users.realname,
            content: req.body.content
        });
        post.countReply++;
        post.updatedAt = Date.now();
        post.save();
        var reply = post.reply[post.reply.length-1].toObject();
        delete reply.isDel;
        res.json({code: 0, reply: reply});
    });
});


//---------------------编辑主题帖------------------------
//只能修改自己发的主题帖，不能修改回复贴,不能修改已经被删除的帖子
router.put('/:courseId/:postId', function(req, res, next) {
    if (!req.body.title) return next("帖子标题不能为空！");
    if (!req.body.content) return next("帖子内容不能为空！");
    postModel.findOne({
        _id: req.params.postId,
        courseId: req.params.courseId,
        userId: req.users._id,
        isDel: 0
    }, function(err, post) {
        if (err) return next(err);
        if (!post) return next("该帖子不存在！");
        post.title = req.body.title;
        post.content = req.body.content;
        post.updatedAt = Date.now();
        post.save();
        res.json({code: 0});
    })
});


//---------------------删除主题帖------------------------
//只能删除自己发的帖子
router.delete('/:courseId/:postId', function(req, res, next) {
    postModel.findOne({
        _id: req.params.postId,
        courseId: req.params.courseId,
        userId: req.users._id,
        isDel: 0
    }, function(err, post) {
        if (err) return next(err);
        if (!post) return next("该帖子不存在！");
        post.isDel++;
        post.save();
        res.json({code: 0});
    });
});


//---------------------删除回复帖------------------------
//只能删除自己发的帖子
router.delete('/:courseId/:postId/:replyId', function(req, res, next) {
    postModel.findOne({
        _id: req.params.postId,
        courseId: req.params.courseId,
        isDel: 0
    }, function(err, post) {
        if (err) return next(err);
        if (!post) return next("该帖子不存在！");
        var reply = post.reply.id(req.params.replyId);
        if (reply &&
            reply._id.equals(req.params.replyId) &&
            reply.userId.equals(req.users._id) &&
            reply.isDel === 0) {
            reply.isDel++;
            post.countReply--;
        } else
            return next("该回复不存在！");
        post.save();
        res.json({code: 0});
    });
});


//-----------------置顶或取消置顶----------------------
//只能置顶主题帖，只有老师可以操作
router.put('/:courseId/:postId/top', function(req, res, next) {
    if (req.users.type !== "teacher") return next("您没有权限置顶！");
    postModel.findOne({
        _id: req.params.postId,
        courseId: req.params.courseId,
        isDel: 0
    }, function(err, post) {
        if (err) return next(err);
        if (!post) return next("该帖子不存在！");
        post.isTop = 1 - post.isTop;
        post.save();
        res.json({code: 0, isTop: post.isTop});
    })
});


//-----------------点赞或取消点赞----------------------
router.put('/:courseId/:postId/like', function (req, res, next) {
    postModel.findOne({
        _id: req.params.postId,
        courseId: req.params.courseId,     //帖子属于本课程
        isDel: 0                           //帖子没有被删除
    }, function(err, post) {
        if (err) return next(err);
        if (!post) return next("该帖子不存在！");
        if (post.likeBy.id(req.users._id)) {
            post.likeBy.id(req.users._id).remove();
            res.json({code: 0, isLike: 0});
        } else {
            post.likeBy.push({
                _id: req.users._id,
                userName: req.users.realname
            });
            res.json({code: 0, isLike: 1});
        }
        post.countLike = post.likeBy.length;
        post.save();
    });
});


module.exports = router;



