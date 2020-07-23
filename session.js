
class Session{
  constructor(accessToken){
    this.userData = {};
    this.accessToken= accessToken;
  }

  set(obj){
    this.userData = obj;
  }

  save(client){
    if(this.accessToken){
      client.setValueinRedis(this.accessToken, JSON.stringify(this.userData))
      .then(()=> client.setExpiryToField(this.accessToken, 60 * 60))
      .catch((err)=>{
        //console.log(err);
      })
    }
  }

  destroy(){
    client.del(this.accessToken);
  }
}

module.exports = Session;
