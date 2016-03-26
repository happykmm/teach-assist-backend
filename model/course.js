var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    intro: {
        type: String
    },
    schedule: {
        type: String
    },
    homework: {
        type: [Schema.Types.ObjectId]
    },
    ppt: {
        type: [Schema.Types.ObjectId]
    },
    teacher: {
        type: String,
        required: true
    }
});

var courseModel = mongoose.model('courses', courseSchema);

module.exports = courseModel;