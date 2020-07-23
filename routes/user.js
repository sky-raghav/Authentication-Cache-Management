const express = require('express');
const router = express.Router();
const rHelpers = require('../redis-helpers');
const userServices = require('../services/user-services');
const emailer = require('../services/mail-service');

const makeid = () => {
   let result = '';
   let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let charactersLength = characters.length;
   for ( let i = 0; i < 40; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

//Getting Details by id
router.get('/:id', (req,res,next) =>{
  const id = req.params.id;
  const values = ['first_name','last_name','email','username'];
  rHelpers.getValuesFromHash('user' + id,values)
  .then((status) => {
    //console.log(status);
    if(status.indexOf(null) > -1){
      res.status(404);
      res.data = {};
      next();
    } else{
      let result = {
        first_name : status[0],
        last_name : status[1],
        email: status[2],
        username: status[3]
      }
      res.status(200);
      res.data = { data : result };
      next();
    }
  })
  .catch( err => {
    res.status(400);
    res.data = {status: 'failure', reason: err};
    next();
  });
})


router.post('/forgot-password', (req,res,next) =>{
  //console.log('/forgot-password', req.body);
  let userEmail = req.body.email;
  let orgId = req.body.org_id;
  var resetCode = makeid();
  emailer(userEmail, orgId, resetCode)
  .then((status) => {
    //console.log('Email sent');
    return rHelpers.setValueinRedis(resetCode, req.session.userData.id)
  })
  .then((status) => {
    //console.log('resetCode saved in redis');
    return rHelpers.setExpiryToField(resetCode, 60 * 60);
  })
  .then((status) => {
    //console.log('resetCode expiry set');
    res.status(200);
    res.data = {status: 'success'};
    next();
  })
  .catch((err) => {
    res.status(401);
    res.data = {status: 'failure'};
    //console.log(err);
    next();
  })
});

router.put('/reset-password', (req, res, next) => {
  let resetCodeInput = req.body.reset_code;
  let newPassword = req.body.new_password;
  if(resetCodeInput){
    rHelpers.getValueFromRedis(resetCodeInput)
    .then((value)=>{
      //console.log('/reset-password', resetCodeInput , value);
      if(req.session.userData.id === value){
        //console.log('resetCode is matched');
        return userServices.updateUserDetails(rHelpers, req.session.userData.id , {password: newPassword})
      } else{
        //console.log('resetCode is not matched');
        res.status(400);
        res.data = {status: 'failure', reason: 'Reset Code doesn\'t match!'};
        next();
      }
    })
    .then((result) =>{
      //console.log('Details updated');
      req.session.userData.password = newPassword;
      res.status(200);
      res.data = {status: 'success'};
      next();
    })
    .catch((err)=>{
      res.status(400);
      res.data = {status: 'failure', reason: err};
      next();
    })
  } else{
    //console.log('no resetCode found');
    res.status(400);
    res.data = {status: 'failure', reason: 'Please give a valid reset code!'};
    next();
  }
});
module.exports = router;
