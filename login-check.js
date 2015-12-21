var router = require("express")();

router.all('*', function(req, res, next) {
    console.log('req');
    res.set('Access-Control-Allow-Origin', '*');

    next();
});

router.get('/*', function(req, res, next) {

    console.log('here')
    //res.json({
    //    code: 1,
    //    desc: "please login first"
    //});
    next();
    //res.end();
});

router.post('/', function(req, res, next) {
    next();
});

router.put('/', function(req, res, next) {
    next();
});

router.delete('/', function(req, res, next) {
    next();
});
console.log(111);
module.exports = router;