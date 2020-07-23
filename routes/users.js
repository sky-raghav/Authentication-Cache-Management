var express = require('express');
var router = express.Router();
const rHelpers = require('../redis-helpers');
const userServices = require('../services/user-services');

//Registering user
router.post('/register', function(req, res, next) {
  const data = {
    id : null,
    first_name : req.body.first_name,
    last_name : req.body.last_name,
    username :req.body.username,
    password :req.body.password,
    email : req.body.email,
  };

  rHelpers.isHashFieldAlreadyExists('usernames', data.username)
  .then( () => {
    return rHelpers.isHashFieldAlreadyExists('emails', data.email);
  })
  .then( () =>{
    return rHelpers.setUserHash('user', data);
  })
  .then((status)=>{
    res.status(201);
    res.data = status;
    next();
  })
  .catch((err)=>{
    res.status(400);
    res.data = {status: 'failure', reason: err};
    next();
  })
});

//User Login
router.post('/login', (req, res, next)=>{
  let username = req.body.username;
  let pswd = req.body.password;
  userServices.getUserDetails(rHelpers, username)
  .then((userDetails) => {
    if(userDetails){
      let {password} = userDetails;
      if(pswd == password){
        //console.log('password match');
        req.session.set(userDetails);
        res.status(200);
        res.data = {access_token : req.session.accessToken};
        //console.log('login next called');
        next();
      } else{
        //console.log('password unmatch');
        res.status(400);
        res.data = {status: 'failure', reason: 'Invalid Password'};
        next();
      }
    } else {
        //console.log('usernam unmatch');
        res.status(400);
        res.data = {status: 'failure', reason: 'Invalid username'};
        next();
    }
  })
  .catch((err)=>{
    //console.log('login error: ',err);
    res.status(400);
    res.data = {status: 'failure', reason: err} ;
    next();
  })
})

module.exports = router;
