const express = require('express');
const router = express.Router();
const jwt= require('../helpers/jwt');
const fs = require("fs").promises;

router.route('/').get( async (request, response, onError ) => {
  try{
/*

    var ret = await process.db.get("SELECT name FROM Users WHERE id=?", request.user.id);
    if(ret==null)  throw {code: -2003, message: 'User not found'};
  */  
    // Eliminada la comprobacion de las licencias
    // var ret = await process.db.get("SELECT name, level, license FROM Users WHERE id=? AND license>datetime('now')", request.user.id);
    var ret = await process.db.get("SELECT name, level, license FROM Users WHERE id=?", request.user.id);
    if(ret==null)  throw {code: -2002, message: 'User not found or Bad license'};
    
    var ret2 = await process.db.run("UPDATE Users SET lastLogin=datetime('now') WHERE id=?", request.user.id);
    if(ret2.changes!=1) throw {code: -2001, message: 'Cant update lastLogin'};
    
    return response.header('auth-token', jwt.issue({id:request.user.id, level: ret.level},'10d')).json({name:ret.name, level:ret.level, license:ret.license});
  }catch(error){
    onError( {code: error.code || -2000, message:  error.message } );
  }      
});

router.route('/code/:scene').get( async (request, response, onError ) => {
  try{
    console.log("/user/code/",request.params.scene);
    // Miramos si ya hay un codigo para este usuario y esta escena.
    var res = await process.db.get("SELECT code FROM Codes WHERE userid=? AND scene=? AND used=0", request.user.id, request.params.scene );
    if(res!=null) return response.json( {code:0, vrcode:res.code} );
    
    const characters = "0123456789";
    const charactersLength = characters.length;
    var code = "";
    for (let i = 0; i < 6; i++) code += characters.charAt(Math.floor(Math.random() * charactersLength));
    var res = await process.db.run("INSERT INTO Codes (code, used, created, userid, scene) VALUES (?, 0, datetime('now'), ?, ?)", code, request.user.id, request.params.scene);
    if( res.changes!=1)  throw {code: -2101, message: 'Cant create code'};
    return response.json( {code:0, vrcode:code} );
  }catch(error){
    onError( {code: error.code || -2100, message:  error.message } );
  }      
});

router.route('/name/:name').get( async (request, response, onError ) => {
  try{
//    console.log("/user/name/",request.params.name);
    var ret = await process.db.run("UPDATE Users SET name=? WHERE id=?", request.params.name, request.user.id);
    if( ret.changes!=1)  throw {code: -2201, message: 'Cant update user name'};
    return response.json( {code:0 } );
  }catch(error){
    onError( {code: error.code || -2200, message:  error.message } );
  }      
});

router.route('/password/:newpass/:oldpass').get( async (request, response, onError ) => {
  try{
    console.log("/user/password/",request.params.newpass, request.params.oldpass);
    var ret = await process.db.get("SELECT id FROM Users WHERE id=? AND password==?", request.user.id, request.params.oldpass);
    if(ret==null) throw {code: -2302, message: 'Bad password'};
    
    var ret = await process.db.run("UPDATE Users SET password=? WHERE id=?", request.params.newpass, request.user.id);
    if(ret.changes!=1) throw {code: -2301, message: 'Cant set new password'};
    
    return response.json({code:0} );
  }catch(error){
    onError( {code: error.code || -2300, message:  error.message } );
  }      
});

router.route('/image').get( async (request, response, onError ) => {
  try{
//    console.log("/user/image");
    return response.setHeader("Content-Type", "image/jpeg").sendFile("/app/images/"+request.user.id+".img");
  }catch(error){
    onError( {code: error.code || -2400, message:  error.message } );
  }      
});

router.route('/image').post( async (request, response, onError ) => {
  try{
    const chunks = [];
    request.on('data', (chunk)=>{ chunks.push(chunk); });    
    request.on('end', async () => {
      const data = Buffer.concat(chunks);
      if(data.length>300*1024 ) throw {code: -2501, message: 'The image cannot exceed the size of 200 Kb.'};
      await fs.writeFile("./images/"+request.user.id+".img", data);
      response.json( {code:0, length: data.length } );
    });
  }catch(error){
    onError( {code: error.code || -2500, message:  error.message } );
  }      
});

router.route('/results/vr').get( async (request, response, onError ) => {
  try{    
//    console.log("/user/results/vr");
    var ret = await process.db.all("SELECT date, scene, signals, signalsOK, distances, distancesOK FROM Results WHERE userid=? AND platform=2 ", request.user.id );
    return response.json( { code:0, results:ret} );
  }catch(error){
    onError( {code: error.code || -2600, message:  error.message } );
  }      
});

router.route('/results/vr/:scene').get( async (request, response, onError ) => {
  try{    
//    console.log("/user/results/vr/",request.params.scene);
    var ret = await process.db.get("SELECT date, signals, signalsOK, distances, distancesOK, data FROM Results WHERE userid=? AND platform=2 AND scene=?", request.user.id, request.params.scene );
    return response.json( { code:0, date:ret.date, signals:ret.signals, signalsOK:ret.signalsOK,distances:ret.distances, distancesOK:ret.distancesOK, data:ret.data } );
  }catch(error){
    onError( {code: error.code || -2600, message:  error.message } );
  }      
});

router.route('/results/web').get( async (request, response, onError ) => {
  try{    
    var ret = await process.db.all("SELECT date, scene, signals, signalsOK, distances, distancesOK FROM Results WHERE userid=? AND platform=1 ", request.user.id );
    return response.json( { code:0, results:ret} );
  }catch(error){
    onError( {code: error.code || -2700, message:  error.message } );
  }      
});

router.route('/results/web/:scene').get( async (request, response, onError ) => {
  try{    
    var ret = await process.db.get("SELECT date, signals, signalsOK, distances, distancesOK, data FROM Results WHERE userid=? AND platform=1 AND scene=?", request.user.id, request.params.scene );
    return response.json( { code:0, date:ret.date, signals:ret.signals, signalsOK:ret.signalsOK,distances:ret.distances, distancesOK:ret.distancesOK, data:ret.data } );
  }catch(error){
    onError( {code: error.code || -2800, message:  error.message } );
  }      
});

router.route('/results/web').post( async (request, response, onError ) => {
  try{
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
    var ret = await process.db.run("DELETE FROM Results WHERE userid=? AND platform=1 AND scene=?", request.user.id, request.body.scene );
    var ret = await process.db.run("INSERT INTO Results (date, platform, userid, scene, signals, signalsOK, distances, distancesOK, data) VALUES (datetime('now'), 1, ?, ?, ?, ?, ?, ?, ?)",
        request.user.id, request.body.scene,
        request.body.signals.length, signalsOK,
        request.body.distances.length, distancesOK,
        JSON.stringify(request.body) );    
    if(ret.changes!=1) throw {code: -2901, message: 'Cant insert data'};
    
    response.json( {code: 0 } );
  }catch(error){
    onError( {code: error.code || -2900, message:  error.message } );
  }      
});

module.exports = { default: router };