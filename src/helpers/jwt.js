const jwt = require('jsonwebtoken');

module.exports = {
  issue(payload, expiresIn){
    if(expiresIn!=null) return jwt.sign(payload, process.env.secret, {expiresIn} );    
    else return jwt.sign(payload, process.env.secret);
  },
  validate(token){ return jwt.verify( token, process.env.secret ); }
}