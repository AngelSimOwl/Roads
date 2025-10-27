const jwt=require('../helpers/jwt');

module.exports = {
  validateToken(request, response, next) {
    const token = request.header('auth-token');
    if (!token) throw {code: -8, message: 'Access denied.'+request.originalUrl};
    try {    
      request.user = jwt.validate( token );      
      next();
    } catch (error) {
      throw { code: -9, message: 'Invalid token'};
    }
  }
}