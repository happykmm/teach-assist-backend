var router = require('express')();

router.all('/up', function(req, res) {
    console.log("callback here!!");
});


module.exports = router;