const express = require('express');
const router = express.Router();

router.route('/').get( async (request, response, onError ) => {
  try{
    var ret = await process.db.all("SELECT module, progress, quizz FROM Modules WHERE userid=?", request.user.id );
    response.json( {code: 0, modules: ret} );
    
  }catch(error){
    onError( {code: error.code || -6000, message:  error.message } );
  }      
});

router.route('/:idmodule').get( async (request, response, onError ) => {
  try{    
    var ret = await process.db.get("SELECT module, progress, quizz FROM Modules WHERE userid=? AND module=?", request.user.id, request.params.idmodule );
    if(ret==null) throw {code: -6101, message: 'Cant found module'};
    response.json( {code: 0, module: ret.module, progress: ret.progress, quizz: ret.quizz} );
  }catch(error){
    onError( {code: error.code || -6100, message:  error.message } );
  }      
});

router.route('/progress/:idmodule/:slider').get( async (request, response, onError ) => {
  try{
    var ret = await process.db.run("INSERT INTO Modules (userid, module, progress) VALUES (?, ?, ?) ON CONFLICT(userid, module) DO UPDATE SET progress=excluded.progress", request.user.id, request.params.idmodule, request.params.slider );
    if(ret.changes!=1) throw {code: -6201, message: 'Cant update progress'};
    response.json( {code: 0} );
  }catch(error){
    onError( {code: error.code || -6200, message:  error.message } );
  }      
});

router.route('/quizz/:idmodule/:state').get( async (request, response, onError ) => {
  try{    
    var ret = await process.db.run("INSERT INTO Modules (userid, module, quizz) VALUES (?, ?, ?) ON CONFLICT(userid, module) DO UPDATE SET quizz=excluded.quizz", request.user.id, request.params.idmodule, request.params.state );
    if(ret.changes!=1) throw {code: -6301, message: 'Cant update quizz'};
    response.json( {code: 0} );
  }catch(error){
    onError( {code: error.code || -6300, message:  error.message } );
  }      
});

module.exports = { default: router };