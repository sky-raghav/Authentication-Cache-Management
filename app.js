const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const authUtils = require('./common/auth-utils');
const session = require('./session');
const rHelpers = require('./redis-helpers');

let indexRouter = require('./routes/index.js');
let usersRouter = require('./routes/users.js');
let userRouter = require('./routes/user.js');
let authRouter = require('./routes/auth.js');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// handelling session routes
app.use((req, res, next) => {
  let routeUrl = req.originalUrl;
  let httpMethod = req.method;
  //console.log('session handler',routeUrl, httpMethod );
  if(authUtils.isNewSessionRequired(httpMethod, routeUrl)){
    let accessToken = authUtils.generateRandomAccessToken();
    req.session = new session(accessToken);
    //console.log('session handler isNewSessionRequired', req.session);
    next();
  } else if(authUtils.isAuthRequired(httpMethod, routeUrl)){
    let accessToken = req.header('Authorization').split(' ')[1];
    //console.log('session handler isAuthRequired', req.session, accessToken);
    if(accessToken){
      authUtils.getRedisSessionData(rHelpers, accessToken)
      .then((data) =>{
        if(data){
          data = JSON.parse(data);
          req.session = new session(accessToken);
          req.session.set(data);
          //console.log('session handler isAuthRequired', req.session);
          next();
        } else{
          return res.status(403).send({status:'failure', reason:'Invalid access Token'})
        }
      })
      .catch((err)=>{
        //console.log(err);
        return res.status(403).send({status:'failure', reason:'Invalid access Token'})
      })
    } else {
      return res.status(403).send({status:'failure', reason:'Missing access Token'})
    }
  }else{
    next();
  }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);

//Response handler

app.use((req, res, next) => {
  //console.log('res handler', req.session);
  if(req.session && req.session.userData && req.session.accessToken){
    try{
      req.session.save(rHelpers);
      //console.log('auth', req.session);
      res.setHeader('Authorization', 'Bearer '+ req.session.accessToken);
      //console.log('res handler authorized res', res.data);
    } catch(err){
      //console.log(err);
    }
  }
  //console.log('res handler res', res.data);
  res.send(res.data || {failure: 'NO Data!'});
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
