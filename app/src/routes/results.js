const express = require('express');
const router = express.Router();

router.route('/all').get( async (request, response, onError ) => {
  try{
//    console.log("/results/all");
    var ret = await process.db.all("SELECT date, scene, signals, signalsOK, distances, distancesOK FROM VRResults");
    response.json( ret );
  }catch(error){
    onError( {code: error.code || -5000, message:  error.message } );
  }      
});

module.exports = { default: router };