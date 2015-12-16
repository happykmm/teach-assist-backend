var express = require("express");
var router = express.Router();

router.get('/', function(req, res) {
    console.log(!!req.db);
    res.json({ message: 'hooray! welcome to our api!' });
});

router.post('/', function(req, res) {
    console.log(req.body);
});

router.put('/', function(req, res) {

});

router.delete('/', function(req, res) {

});

module.exports = router;