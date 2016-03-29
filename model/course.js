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
        filename: {
            type: String,
            required: true
        },
        storename: {
            type: String,
            required: true
        },
        timestamp: {
            type: Number,
            required: true,
            default: Date.now
        }
    },
    teacher: {
        type: String,
        required: true
    }
});

var courseModel = mongoose.model('courses', courseSchema);

module.exports = courseModel;