const { assert } = require('chai');

const { generateRandomString, getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  123456: {
    longURL: "www.lighthouselabs.ca",
    id: "user2RandomID"
  },
  234567: {
    longURL: "www.google.ca",
    id: "user2RandomID"
  },
  345678: {
    longURL: "www.youtube.ca",
    id: "user2RandomID"
  },
};

describe('generateRandomString', function() {
  it('generate a random 6 character string', function() {
    const length = generateRandomString().length
    const expectedNum = 6;
    assert.equal (length, expectedNum)
  });
});

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal (user, expectedUserID)
  });
});

describe('getUserByEmail', function() {
  it('should return undefined as an email', function() {
    const user = getUserByEmail("nouser@example.com", testUsers)
    const expected = undefined;
    assert.equal (user, expected)
  });
});

describe('urlsForUser', function() {
  it('should return all information that a user has access to', function() {
    const availableUrls = urlsForUser("user2RandomID", urlDatabase)
    const expected = {
      123456: {
        longURL: "www.lighthouselabs.ca",
        id: "user2RandomID"
      },
      234567: {
        longURL: "www.google.ca",
        id: "user2RandomID"
      },
      345678: {
        longURL: "www.youtube.ca",
        id: "user2RandomID"
      },
    };;
    assert.deepEqual (availableUrls, expected)
  });
});