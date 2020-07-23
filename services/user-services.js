const getUserDetails = (client, username) => {
  return client.getValuesFromHash('usernames',username)
  .then( (id) => {
    return client.getValuesFromHash('user' + id);
  })
  .catch( (err) => {
    throw err;
  });
}

const updateUserDetails = (client, id, data) => {
  //console.log('updateUserDetails', id, data);
  return client.setValueInAnyHash('user' + id, data)
  .catch((err) => {
    throw err;
  })
}

module.exports = {
  getUserDetails: getUserDetails,
  updateUserDetails: updateUserDetails,
}
