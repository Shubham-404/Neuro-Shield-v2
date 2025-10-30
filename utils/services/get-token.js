const jwt = require('jsonwebtoken');

function getToken(data){
    return jwt.sign(data, process.env.JWT_SECRET)
}

module.exports = getToken;