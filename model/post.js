var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


var replySchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'users',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});


var postSchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'users',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    courseId: {
        type: ObjectId,
        ref: 'courses',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: ""
    },
    content: {
        type: String,
        required: true,
        default: ""
    },
    countRead: {
        type: Number,
        required: true,
        default: 0
    },
    countLike: {
        type: Number,
        required: true,
        default: 0
    },
    countReply: {
        type: Number,
        required: true,
        default: 0
    },
    isTop: {
        type: Number,
        required: true,
        default: 0
    },
    isDel: {
        type: Number,
        required: true,
        default: 0
    },
    likeBy: [{
        _id: {
            type: ObjectId,
            ref: 'users',
            required: true
        },
        userName: {
            type: String,
            required: true
        }
    }],
    reply: [replySchema]
},
{
    timestamps: true
});


var postModel = mongoose.model('posts', postSchema);

module.exports = postModel;