const express = require('express');
const router = express.Router();
const rHelpers = require('../redis-helpers');

router.get('/secured', (req, res, next) =>{
  res.status(200);
  res.data = req.session.userData;
  next();
})

module.exports = router;
