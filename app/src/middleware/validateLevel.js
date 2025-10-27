module.exports = {
  validateSupervisorLevel(request, response, next) {
    if(request.user.level>10) next();
    else {
      console.log("request.user.level "+request.user.level+" >10");
      throw {code: -6, message: 'Insufficient user level (Supervisor).'};
    }
  },
  validateMasterLevel(request, response, next) {
    if(request.user.level>100) next();
    else {
      console.log("request.user.level "+request.user.level+" >100")
      throw {code: -7, message: 'Insufficient user level (Master).'};
    }
  }

}