var router = require('express')();

router.post('/up', function(req, res) {
    console.log(req.body);

    res.json({
        success: true,
        name: req.body.name
    });
});


module.exports = router;