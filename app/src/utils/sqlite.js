const fs = require("fs");
const dbFile = "./.data/roadsproject.db";
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");

//if(fs.existsSync(dbFile)) { fs.unlinkSync(dbFile); console.log("Remove BDD"); }
var needToCreateBDD=!fs.existsSync(dbFile)

dbWrapper.open({ filename: dbFile, driver: sqlite3.Database }).then(async dBase => {
    process.db = dBase;
  
  
//  var ret = await process.db.run("UPDATE Users SET license=DATETIME(datetime('now'), '+10 years') WHERE id=5");
//   var ret = await process.db.all("SELECT *, license FROM Users");
//  console.log("usuarios",ret);
  
    try {
      
//      var ret = await process.db.all("SELECT * FROM Users");
//      console.log(ret);
      
//      var ret = await process.db.run("UPDATE Users SET level=? WHERE id=?", 999, 5);
      
      if (needToCreateBDD) {
        
        await process.db.run("CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT, lastLogin DATETIME, name TEXT, level INTEGER, license DATETIME)");
        await process.db.run("CREATE TABLE Codes (code TEXT PRIMARY KEY, used INTEGER, created DATETIME, userid INTEGER, scene INTEGER)");
        await process.db.run("CREATE TABLE Modules (userid INTEGER, module INTEGER, progress INTEGER, quizz INTEGER, PRIMARY KEY (userid, module))");
        // await process.db.run("CREATE INDEX Modules_userid ON Modules(userid)"); // Inice par mejorar las busquedas por userid
        // WEB 1, VR 2
        await process.db.run("CREATE TABLE Results (userid INTEGER, platform INTEGER, scene INTEGER, date DATETIME, data TEXT, signals INTEGER, signalsOK INTEGER, distances INTEGER, distancesOK INTEGER, PRIMARY KEY (userid, platform, scene))");
        // await process.db.run("CREATE INDEX Results_userid_ ON Modules(userid)"); // Inice par mejorar las busquedas por userid
        
        // Placeholders.
        await process.db.run("INSERT INTO Users (email, password, name, level, license) VALUES ('gunderwulde@gmail.com', '2d0adf37f56b2041d6312a54d1e2f7afc6b4f61f', 'Fernando', 999, DATETIME(datetime('now'), '+10 years'))");
        await process.db.run("INSERT INTO Users (email, password, name, level, license) VALUES ('angel.gil@renderside.com', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', 'Angel', 999, DATETIME(datetime('now'), '+10 years'))");
        await process.db.run("INSERT INTO Users (email, password, name, level, license) VALUES ('alfonso.cortes@ac2sc.es', 'd3a7be047e71b8ec096cbd70f52f834d305fd514', 'Alfonso', 999, DATETIME(datetime('now'), '+10 years'))");
        await process.db.run("INSERT INTO Codes (code, created, userid, scene) VALUES ('661285', datetime('now'), 1, 1)");
        
        await process.db.run("INSERT INTO Users (email, password, name, level, license) VALUES ('angel.gil@renderside.com', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', 'Angel', 999, DATETIME(datetime('now'), '+10 years'))");
        
      }
      var ret = await process.db.get("SELECT id, name, level, license FROM Users WHERE email='alfonso.cortes@ac2sc.es'");
//      console.log("ret",ret);
//      var ret = await process.db.run("UPDATE Users SET level=? WHERE id=?", 999, ret.id );
    } catch (dbError) {
      console.log("ERROR!!!!");
      console.error(dbError);
    }
  });

// Our server script will call these methods to connect to the db
module.exports = {
  createUser: async (email, pass) => {
    return await process.db.run("INSERT INTO Users (email, password, level) VALUES (?, ?, ?)", email, pass, 1);
  },
  activateUser: async (id, days) => {
    var daysParam = '+'+days+' days';
    return await process.db.run("UPDATE Users SET license=DATETIME(datetime('now'), ?) WHERE id=?", daysParam, 1)
  },
  extendLicense: async (id, days) => {
    var daysParam = '+'+days+' days';    
    return await process.db.run("UPDATE Users SET license=DATETIME(license, ?) WHERE id=?",daysParam, 1)
  }
};
