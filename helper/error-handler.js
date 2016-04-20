module.exports = function(err, req, res, next) {
    console.error(err.stack);
    console.error(err.toString());
    res.json({code:1, desc:err.toString()});
};