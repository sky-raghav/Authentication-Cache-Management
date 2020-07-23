const rClient = require('./redis-client');

//Normal Helpers
const setValueinRedis = (field, value) => {
  return new Promise( (resolve, reject) => {
    rClient.set(field, value, (err, result) => {
      if(err){
        reject(err);
      } else{
        resolve(result);
      }
    })
  })
  .catch((err)=>{
    throw err;
  })
}

const getValueFromRedis = (field) => {
  return new Promise( (resolve, reject) => {
    rClient.get(field, (err, result) => {
      if(err){
        reject(err);
      } else if(result != null){
        //console.log('getValueFromRedis Resolve',result);
        resolve(result);
      }
      else{
        reject('No field found!')
      }
    })
  })
  .catch((err)=>{
    //console.log('getValueFromRedis err',err);
    throw err;
  })
}

const deleteFieldFromRedis = (field) => {
  return new Promise( (resolve, reject) => {
    rClient.del(field, (err,result) => {
      if(err){
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  })
  .catch(err => {
    throw err;
  });
}

//Hash Helpers

const isHashFieldAlreadyExists = (hash, val) => {
  return new Promise( (resolve,reject) => {
    rClient.hexists(hash, val, (err, result)=>{
      if(err){
        reject(err);
      } else{
        if(result===0){
          resolve(result);
        } else{
          reject(val + ' is already exists!')
        }
      }
    });
  })
  .catch((err)=>{
    throw err;
  })
};
const setValueInAnyHash = (hash, data) => {
  //console.log('setValueInAnyHash', hash , data);
  return new Promise( (resolve,reject) => {
    rClient.hmset(hash, data, (err, result)=>{
      if(err){
        reject(err);
      } else{
        resolve(data);
      }
    });
  })
  .catch((err)=>{
    throw err;
  })
}

const setUserHash = (hash, data)=> {
  return new Promise((resolve, reject)=>{
    rClient.incr('id', (err, id) =>{
      if(err){
       reject(err);
      } else{
        data.id = id;
        let useraNameObj = {};
        useraNameObj[data.username] = id;
        let emailObj = {};
        emailObj[data.email] = id;
        setValueInAnyHash(hash + id, data)
        .then( () => setValueInAnyHash('usernames', useraNameObj ))
        .then( () => setValueInAnyHash('emails', emailObj ))
        .then(resolve(data))
        .catch((err)=>{
          throw err;
        })
      }
    })
  })
  .catch((err)=>{
   throw err;
  });
}

const getValuesFromHash = (hash, values) =>{
  return new Promise( (resolve, reject) => {
    if(values){
      rClient.hmget(hash, values , (err, result) =>{
        if(err){
          reject(err);
        } else{
          resolve(result);
        }
      })
    } else{
        rClient.hgetall(hash, (err, result) =>{
          if(err){
            reject(err);
          } else{
            resolve(result);
          }
        })
      }
  })
  .catch(err => {
    throw err;
  })
}

//Clearing Redis Client

const flushAll = () => {
  return new Promise((resolve, reject)=>{
    rClient.flushall((err,result)=>{
      if(err){
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  })
  .catch(err => {
    throw err;
  });
}


const setExpiryToField = (field, duration) =>{
  return new Promise( (resolve, reject) =>{
    rClient.expire(field, duration, (err, result) => {
      if(err){
        reject(err);
      }
      else{
        resolve(result);
      }
    });
  })
  .catch(err => {
    throw err;
  });
}

module.exports = {
  setValueinRedis : setValueinRedis,
  getValueFromRedis: getValueFromRedis,
  deleteFieldFromRedis: deleteFieldFromRedis,
  isHashFieldAlreadyExists : isHashFieldAlreadyExists,
  setValueInAnyHash: setValueInAnyHash,
  setUserHash : setUserHash,
  getValuesFromHash : getValuesFromHash,
  flushAll : flushAll,
  setExpiryToField: setExpiryToField
}
