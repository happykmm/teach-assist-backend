var router = require("express")();
var qiniu = require('qiniu');


qiniu.conf.ACCESS_KEY = "9aJS9z4k3tz1-YWmcW2BnZr6imrVJeIo8gffioMY";
qiniu.conf.SECRET_KEY = "CJTmK6SY0DgiUsKjashWvp1z-Iob9pTlnWhYGt-L";

router.get('/token', function(req, res) {
    var putPolicy = new qiniu.rs.PutPolicy("tasystem");
    //putPolicy.expires = 3600;
    putPolicy.callbackUrl = "https://teachassist.xyz:8080/qiniu/up";
    putPolicy.callbackBody = "$(fname)";
    console.log(putPolicy);
    res.json({code:0, token:putPolicy.token()});
});

router.post('/callback', function(req, res) {

});

module.exports = router;
