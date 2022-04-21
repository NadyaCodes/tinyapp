const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
}


function generateRandomString() {
  let randomString = ""
  const stringOptions = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  for (let i = 0; i < 6; i++) {
    randomString += stringOptions[Math.floor(Math.random() * stringOptions.length)]
  }
  return randomString;
}


function urlsForUser(userId) {
  let myURLs = {};

  for (let key in urlDatabaseObject) {
    if(urlDatabaseObject[key].userID === userId) {
        myURLs[key] = urlDatabaseObject[key]
    }
  }
  return myURLs
}


module.exports = { 
  getUserByEmail, 
  generateRandomString,
  urlsForUser,
}
