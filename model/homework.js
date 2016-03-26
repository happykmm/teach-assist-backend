var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var homeworkSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    problem: {
        type: String
    },
    deadline: {
        type: Number,
        required: true
    },
    strict: {
        type: Boolean,
        required: true
    }
});

var homeworkModel = mongoose.model('homework', homeworkSchema);

module.exports = homeworkModel;