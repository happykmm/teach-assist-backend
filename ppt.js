var router = require("express")();
var ObjectId = require('mongodb').ObjectId;
var qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = "9aJS9z4k3tz1-YWmcW2BnZr6imrVJeIo8gffioMY";
qiniu.conf.SECRET_KEY = "CJTmK6SY0DgiUsKjashWvp1z-Iob9pTlnWhYGt-L";

router.get('/token', function(req, res) {
    var scope = req.query.scope;
    var deadline = moment().add(1, 'hours').valueOf();
    var putPolicy = new qiniu.rs.PutPolicy("tasystem");
    res.json({code:0,token:putPolicy.token()});
});

module.exports = router;
