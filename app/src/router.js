const express = require('express');
const validateToken = require('./middleware/validateToken').validateToken;
const { validateSupervisorLevel, validateMasterLevel} = require('./middleware/validateLevel');
const restRouter = express.Router();

// ERROR_RANGE: -1000
restRouter.use('/auth', require('./routes/auth').default );

// ERROR_RANGE: -2000
restRouter.use('/user', validateToken, require('./routes/user').default );

// ERROR_RANGE: -3000
restRouter.use('/codes', require('./routes/codes').default ); 

// ERROR_RANGE: -4000
restRouter.use('/license', validateToken, validateSupervisorLevel, require('./routes/license').default );

// ERROR_RANGE: -5000
restRouter.use('/results', validateToken, validateSupervisorLevel, require('./routes/results').default );

// ERROR_RANGE: -6000
restRouter.use('/modules', validateToken, require('./routes/modules').default );

module.exports = { restRouter : restRouter };