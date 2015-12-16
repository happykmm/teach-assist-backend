var express = require("express");
var router = express.Router();

router.get('/', function(req, res) {
    console.log("params:");
    console.log(req.params);
    console.log("body:");
    console.log(req.body);
    console.log("content-type:"+req.get('content-type'));
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    var cursor = req.db.collection("courses").find( { teacher: "jjm"} );
    cursor.each(function(err, doc) {
        if (err === null) {
            result.content.push(doc);
            console.log(doc);
        } else {
            result.code = 1;
            result.desc = err.toString();
            return false;
        }
    });
    res.json(result);
});

router.post('/', function(req, res) {
    console.log("params:");
    console.log(req.params);
    console.log("body:");
    console.log(req.body);
    console.log("content-type:"+req.get('content-type'));
});

router.put('/', function(req, res) {

});

router.delete('/', function(req, res) {

});

module.exports = router;