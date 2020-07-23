const uuid = require('node-uuid');
const newSessionRoutes = [ { path : '/users/login', method: 'POST' }];
const authRoutes = [ { path : '/auth/secured', method: 'GET' }, { path : '/user/forgot-password', method: 'POST' }, { path : '/user/reset-password', method: 'PUT' }];

const generateRandomAccessToken = () => uuid.v4();

//Checking if new session is required
const isNewSessionRequired = (httpMethod, url) => {
  for(let routeObj of newSessionRoutes){
    if(routeObj.path === url && routeObj.method === httpMethod){
      return true;
    }
  }
  return false;
}

//Checking if the route is authorised
const isAuthRequired = (httpMethod, url) => {
  for(let routeObj of authRoutes){
    if(routeObj.path === url && routeObj.method === httpMethod){
      return true;
    }
  }
  return false;
}

const getRedisSessionData = (client, accessToken) => {
  return client.getValueFromRedis(accessToken)
  .catch((err) => {
    throw err;
  })
}

module.exports = {
  isNewSessionRequired : isNewSessionRequired,
  isAuthRequired : isAuthRequired,
  generateRandomAccessToken: generateRandomAccessToken,
  getRedisSessionData: getRedisSessionData
}
