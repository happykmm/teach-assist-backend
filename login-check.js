var router = require("express")();

//Allow CORS
router.all('*', function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    next();
});


function checkToken(req, res, next, token) {
    if (!token) {
        res.json({code: 1, desc: "Please login first!"});
        return false;
    }
    var cursor = req.db.collection('users').find({ token: token }).limit(1);
    cursor.each(function(err, doc) {
        if (err === null) {
            if (doc !== null) {
                console.log(doc);
                req.users = {
                    _id: doc._id,
                    type: doc.type,
                    number: doc.number,
                    realname: doc.realname,
                    intro: doc.intro,
                    courses: doc.courses || []
                }
                next();
                return false;
            } else
                res.json({ code: 1, desc: "Please Login first!" });
        } else
            res.json({ code: 1, desc: "Internal Server Error!" });

    });
}


router.get('*', function(req, res, next) {
    checkToken(req, res, next, req.query.token);
});

router.post('*', function(req, res, next) {
    checkToken(req, res, next, req.body.token);
});

router.put('*', function(req, res, next) {
    checkToken(req, res, next, req.body.token);
});

router.delete('*', function(req, res, next) {
    checkToken(req, res, next, req.query.token);
});

module.exports = router;