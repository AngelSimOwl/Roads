const express = require('express');
const router = express.Router();
const jwt= require('../helpers/jwt');
const crypto = require('crypto')
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({ host: "cp7161.webempresa.eu", port: 465, secure: true, auth: { user: "projectmaster@renderside.com", pass: "Qaz741!!!" } } );
const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

router.route('/create/:email/:password/:name').get( async (request, response, onError ) => {
  try{
//    console.log("/auth/create/",request.params.email, request.params.password, request.params.name );
    if(!request.params.email.match(emailFormat))  throw {code: -1004, message: 'Invalid email'};
    
    var ret = await process.db.get("SELECT id FROM Users  WHERE email=?", request.params.email);
    if(ret!=null) throw {code: -1003, message: 'User exists'};
    
    var ret = await process.db.run("INSERT INTO Users (email, password, lastLogin, name, level, license) VALUES (?,?,datetime('now'),?,0, DATETIME(datetime('now'), '+15 days'))",request.params.email, request.params.password, request.params.name);
    if( ret.changes!=1)  throw {code: -1002, message: 'Cant create code'};
    
    var ret = await process.db.get("SELECT id, name, level, license FROM Users WHERE email=? AND password=?", request.params.email, request.params.password);
    if(ret==null)  throw {code: -1001, message: 'User not found'};
    return response.header('auth-token', jwt.issue({id:ret.id, level: ret.level},'10d')).json({name:ret.name, level:ret.level, license:ret.license});
  }catch(error){
    onError( { code: error.code || -1000, message:  error.message } );
  }      
});

router.route('/recovery/:email').get( async (request, response, onError ) => {
  try{
//    console.log("/auth/recovery/",request.params.email);
    if(!request.params.email.match(emailFormat))  throw {code: -1103, message: 'Invalid email'};

    var ret = await process.db.get("SELECT id, name FROM Users WHERE email=?", request.params.email);
    if(ret==null) throw {code: -1102, message: 'User email not found'};
    var userName = ret.name;
    
    // Genera un nuevo password.
    const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    const charactersLength = characters.length;
    var newPass = "";
    for (let i = 0; i < 8; i++) newPass += characters.charAt(Math.floor(Math.random() * charactersLength));
    var newHash = crypto.createHash('sha1').update(newPass).digest('hex');
    
    // Actualiza el registro del usuario
    var ret = await process.db.run("UPDATE Users SET password=? WHERE id=?", newHash, ret.id);
    if( ret.changes!=1)  throw {code: -1101, message: 'Cant update user password'};
    
    
    const info = await transporter.sendMail({
      from: '"Project Master" <projectmaster@renderside.com>',
      to: request.params.email,
      subject: "Recuperación de la contraseña.",
      text: "Hola "+userName+",\n\nParece que has solictado una recuperacíon de contraseña.\n\nPuedes usar esta contraseña temporal "+newPass+"\n\nNo olvides cambiarla!",
      html: "Hola "+userName+",<br><br>Parece que has solictado una recuperacíon de contraseña.<br><br>Puedes usar esta contraseña temporal <b>"+newPass+"</b><br><br>No olvides cambiarla!",
    });        
    
    return response.json({code:0 });
  }catch(error){
    onError( { code: error.code || -1100, message:  error.message } );
  }      
});

router.route('/:email/:password').get( async (request, response, onError ) => {
  try{
    console.log("/auth/",request.params.email, request.params.password);    
    if(!request.params.email.match(emailFormat))  throw {code: -1203, message: 'Invalid email'};
    
    // Eliminada la comprobacion de las licencias
    // var ret = await process.db.get("SELECT id, name, level, license FROM Users WHERE email=? AND password=? AND license>datetime('now')", request.params.email, request.params.password);
    var ret = await process.db.get("SELECT id, name, level, license FROM Users WHERE email=? AND password=?", request.params.email, request.params.password);
    if(ret==null)  throw {code: -1202, message: 'User not found or Bad license'};
    var ret2 = await process.db.run("UPDATE Users SET lastLogin=datetime('now') WHERE id=?", ret.id);
    if(ret2.changes!=1) throw {code: -1201, message: 'Cant update lastLogin'};
    
    return response.header('auth-token', jwt.issue({id:ret.id, level: ret.level},'10d')).json({name:ret.name, level:ret.level, license:ret.license });
  }catch(error){
    onError( { code: error.code || -1200, message:  error.message } );
  }      
});


module.exports = { default: router };