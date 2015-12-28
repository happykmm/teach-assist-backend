var router = require("express")();


router.all('*', function(req, res, next) {
    //Allow CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'x-access-token,Content-Type');
    next();
});


module.exports = router;
