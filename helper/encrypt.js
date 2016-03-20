var jsSHA = require('jssha');

var shaObj = new jsSHA("SHA-512", "TEXT");

function salt(str1, str2) {
    return "!H@Xa2Tf^JQ9E($5" + str1 + "06%4eA2-iZ*v" + str2 + " B+.x)x05O#OPkT";
}

function encrypt(str1, str2) {
    shaObj.update( salt(str1, str2) );
    return shaObj.getHash("HEX");
}

module.exports = encrypt;
