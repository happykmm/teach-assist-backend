var router = require('express')();

router.all('/up', function(req, res) {
    console.log("callback here!!");
    console.log(req.body);
});


module.exports = router;