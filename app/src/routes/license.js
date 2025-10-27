const express = require('express');
const router = express.Router();

router.route('/userslist/:offset/:limit').get( async (request, response, onError ) => {
  try{
    var ret = await process.db.all("SELECT id, email, name, license, level FROM Users LIMIT ? OFFSET ?", request.params.limit, request.params.offset );
    return response.json( {code:0, users: ret } );
  }catch(error){
    onError( {code: error.code || -4000, message:  error.message } );
  }      
});

router.route('/extend/:userid/:days').get( async (request, response, onError ) => {
  try{    
    var ret = await process.db.run("UPDATE Users SET license=DATETIME(license, ?) WHERE id=?", "+"+request.params.days+" days", request.params.userid );
    if(ret.changes!=1) throw {code: -4101, message: 'Cant update license'};
    
    var ret = await process.db.get("SELECT license FROM Users WHERE id=?", request.params.userid );
    return response.json( {code:0, license: ret.license } );
  }catch(error){
    onError( {code: error.code || -4100, message:  error.message } );
  }      
});

router.route('/set/:userid/:days').get( async (request, response, onError ) => {
  try{    
    var ret = await process.db.run("UPDATE Users SET license=DATETIME(datetime('now'), ?) WHERE id=?", "+"+request.params.days+" days", request.params.userid );
    if(ret.changes!=1) throw {code: -4201, message: 'Cant update license'};
    
    var ret = await process.db.get("SELECT license FROM Users WHERE id=?", request.params.userid );
    return response.json( {code:0, license: ret.license } );
  }catch(error){
    onError( {code: error.code || -4200, message:  error.message } );
  }      
});

router.route('/revoque/:userid').get( async (request, response, onError ) => {
  try{
    var ret = await process.db.run("UPDATE Users SET license='2020-01-01 0:00:00' WHERE id=?", request.params.userid );
    if(ret.changes!=1) throw {code: -4301, message: 'Cant update license'};
    
    var ret = await process.db.get("SELECT license FROM Users WHERE id=?", request.params.userid );
    return response.json( {code:0, license: ret.license } );
  }catch(error){
    onError( {code: error.code || -4300, message:  error.message } );
  }      
});

router.route('/level/:userid/:level').get( async (request, response, onError ) => {
  try{
    var ret = await process.db.run("UPDATE Users SET level=? WHERE id=?", request.params.level, request.params.userid );
    if(ret.changes!=1) throw {code: -4401, message: 'Cant update user level'};
    
    var ret = await process.db.get("SELECT license FROM Users WHERE id=?", request.params.userid );
    return response.json( {code:0, license: ret.license } );
  }catch(error){
    onError( {code: error.code || -4400, message:  error.message } );
  }      
});

module.exports = { default: router };