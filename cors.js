var router = require("express")();


router.all('*', function(req, res, next) {
    //Allow CORS
    res.set('Access-Control-Allow-Origin', '*');
    next();
});


module.exports = router;
