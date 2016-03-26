var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var submitSchema = new Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    homework_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    course_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    answer: {
        type: String
    },
    timestamp: {
        type: Number,
        required: true
    },
    score: {
        type: String
    },
    comment: {
        type: String
    }
});

var submitModel = mongoose.model('submits', submitSchema);

module.exports = submitModel;