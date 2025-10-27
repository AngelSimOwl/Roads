const express = require('express');
const router = express.Router();

router.route('/validate/:code').get( async (request, response, onError ) => {
  try{
    //console.log("/codes/validate/", request.params.code);
    var ret = await process.db.get("SELECT Users.id, Users.name, Codes.scene, Codes.created FROM Codes INNER JOIN Users ON Codes.userid=Users.id WHERE Codes.code=?", request.params.code);
    if(ret==null) throw {code: -3001, message: 'Cant find the code '+request.params.code};
    var ret2 = await process.db.get("SELECT data FROM Results WHERE userid=? AND platform=2 AND scene=?", ret.id, ret.scene);
    response.json( {code: 0, name: ret.name, scene: ret.scene, created: ret.created, data: ret2==null?null:ret2.data } );
  }catch(error){
    onError( {code: error.code || -3000, message:  error.message } );
  }      
});

router.route('/image/:code').get( async (request, response, onError ) => {
  try{
    // console.log("codes/image/", request.params.code);
    var ret = await process.db.get("SELECT userid FROM Codes WHERE Codes.code=?", request.params.code);
    console.log("ret",request.params.code,"->",ret);
    if(ret==null) throw {code: -3101, message: 'Cant find the code '+request.params.code};
    return response.sendFile("/app/images/"+ret.userid+".img");
  }catch(error){
    onError( {code: error.code || -3100, message:  error.message } );
  }      
});

router.route('/close/:code').post( async (request, response, onError ) => {
  try{    
//    console.log("/codes/close/",request.params.code, request.body);
    // Datos a extraer.
    var signalsOK = 0;
    var signals = request.body.signals;
    for(var i=0;i<signals.length;++i){
      if( signals[i].result )
          signalsOK++;
    }
    var distancesOK = 0;
    var distances = request.body.distances;
    for(var i=0;i<distances.length;++i){
      if( distances[i].result )
          distancesOK++;
    }
    // Borra si existe info del usuadio/scena anterior. Esto deberia de ser un UPSER pero no se si SQLite lo permite.
    var ret = await process.db.run("DELETE FROM Results WHERE ROWID IN ( SELECT r.ROWID FROM Results r INNER JOIN Codes c ON (r.userid = c.userid AND r.platform =2 AND r.scene = c.scene) WHERE c.code=?)", request.params.code);
    
    var ret = await process.db.run("INSERT INTO Results (date, platform, userid, scene, signals, signalsOK, distances, distancesOK, data) SELECT datetime('now'), 2, userid, scene, ?, ?, ?, ?, ? FROM Codes WHERE code=?",
        request.body.signals.length, signalsOK,
        request.body.distances.length, distancesOK,
        JSON.stringify(request.body), request.params.code );
    
    if(ret.changes!=1) throw {code: -3202, message: 'Cant find the code '+request.params.code};
    if(request.params.code!="778199"){
      var ret = await process.db.run("DELETE FROM Codes WHERE code=?", request.params.code);
      if(ret.changes!=1) throw {code: -3203, message: 'Cant find the code '+request.params.code};
    }
    response.json( {code: 0, message: "Code "+request.params.code+" closed." } );
  }catch(error){
    onError( {code: error.code || -3200, message:  error.message } );
  }      
});

module.exports = { default: router };
