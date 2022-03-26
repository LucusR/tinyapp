const generateRandomString = function() {
  return Math.random().toString(36).slice(-6);
};

//function to get userID from email
const getUserByEmail = function(email, database) {
  for (let iii in database) {
    if (database[iii].email === email) {
      return database[iii].id;
    }
  }
};

//returns all shorturls that belong to user
const urlsForUser = function(id, database) {
  let userURLS = {};
  for (let short in database) {
    if (database[short].id === id) {
      userURLS[short] = database[short];
    }
  }
  return userURLS;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };