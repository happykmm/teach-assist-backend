var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    type: {
        type: String,
        enum: ['teacher', 'student'],
        required: true
    },
    number: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    realname: {
        type: String,
        required: true
    },
    courses: {
        type: [Schema.Types.ObjectId]
    },
    intro: {
        type: String
    }
});

var userModel = mongoose.model('users', userSchema);

module.exports = userModel;