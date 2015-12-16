var express = require("express");
var router = express.Router();

router.get('/', function(req, res) {
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    var cursor = req.db.collection("courses").find( { teacher: req.query.teacher} );
    cursor.each(function(err, doc) {
        if (err === null) {
            if (doc !== null) {
                result.content.push(doc);
            } else {
                res.json(result);
            }
        } else {
            result.code = 1;
            result.desc = err.toString();
            return false;
        }
    });
});

router.post('/', function(req, res) {
    console.log(req.body);
    res.json(req.body);
});

router.put('/', function(req, res) {
    console.log(req.body);
    res.json(req.body);
});

router.delete('/', function(req, res) {
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;