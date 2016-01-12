var router = require('express')();

router.post('up', function(req, res) {
    console.log("callback here!!");
});


module.exports = router;