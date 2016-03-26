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
        required: true
    },
    content: {
        type: String
    },
    timestamp: {
        type: Number,
        required: true,
        default: Date.now
    },
    parent: {
        required: true,
        default: 0
    },
    count_read: {
        type: Number,
        required: true,
        default: 0
    },
    count_zan: {
        type: Number,
        required: true,
        default: 0
    },
    top: {
        type: Number,
        required: true,
        default: 0
    }
});

var postModel = mongoose.model('posts', postSchema);

module.exports = postModel;