const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    const userObj = user.id;
    assert.equal(userObj, expectedUserID);
  });
  it('should return undefined if email is not saved', function() {
    const userObj = getUserByEmail("a@example.com", testUsers);
    assert.strictEqual(userObj, undefined);
  });
});