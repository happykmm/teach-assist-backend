router.get('/', function(req, res) {
    console.log(req.users);
    var result = {
        code: 0,
        desc: "success!",
        content: []
    };
    var cursor = req.db.collection("courses").find( { user_id: req.users._id} );
    cursor.each(function(err, doc) {
        if (err === null) {
            if (doc !== null) {
                result.content.push(doc);
            } else {
                res.json(result);
            }
        } else {
            result.code = 1;
            result.desc = err.toString();
            res.json(result);
            return false;
        }
    });
});

router.post('/', function(req, res) {
    var name = req.body.name;
    var teacher = req.body.teacher;
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("courses").insertOne( { "name":name,"teacher":teacher} );
    res.json(result);
});

router.put('/', function(req, res) {
    var newname=req.body.newname;
    var teacher=req.body.teacher;
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("courses").updateOne
    (
        { "teacher": teacher },
        { $set:{ "name":newname } }
    );
    res.json(result);
});

router.delete('/', function(req, res) {
    var name=req.query.names;
    var result = {
        code: 0,
        desc: "success!"
    };
    req.db.collection("courses").deleteOne( { "name":name } );
    res.json(result);
});