var router = require("express")();


router.all('*', function(req, res, next) {
    //Allow CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'x-access-token,Content-Type,If-Modified-Since');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});


module.exports = router;
