var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    course_id: {
        type: Schema.Types.ObjectId,
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
    parent: {
        type: Schema.Types.ObjectId,
        default: null
    },
    count_read: {
        type: Number,
        required: true,
        default: 0
    },
    count_like: {
        type: Number,
        required: true,
        default: 0
    },
    count_reply: {
        type: Number,
        required: true,
        default: 0
    },
    top: {
        type: Number,
        required: true,
        default: 0
    },
    del: {
        type: Number,
        required: true,
        default: 0
    },
    like: {
        type: [{
            user_id: {
                type: Schema.Types.ObjectId,
                required: true
            },
            user_name: {
                type: String,
                required: true
            }
        }]
    }
},
{
    timestamps: true
});

var postModel = mongoose.model('posts', postSchema);

module.exports = postModel;