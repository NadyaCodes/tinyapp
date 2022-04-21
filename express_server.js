const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['This is my first key'],
}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const { getUserByEmail, generateRandomString } = require('./helpers.js');

const urlsForUser = function(userId) {
  let myURLs = {};

  for (let key in urlDatabaseObject) {
    if (urlDatabaseObject[key].userID === userId) {
      myURLs[key] = urlDatabaseObject[key];
    }
  }
  return myURLs;
};


const urlDatabaseObject = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }

};


app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login");
  }
});



app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {
      errorMessage: "ERROR - 403 - User must be logged in to view URLs. Please login or register for an account.",
      user: null
    };
    res.status('403');
    return res.render("no_access", templateVars);
  }


  const userId = req.session.user_id;
  let userURLs = urlsForUser(userId);

  const templateVars = {
    user: users[userId],
    urls: userURLs
  };

  return res.render("urls_index", templateVars);
});


//creates a new entry
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {
      errorMessage: "ERROR - 403 - User must be logged in to submit URLs",
      user: null
    };
    res.status('403');
    return res.render("no_access", templateVars);
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  urlDatabaseObject[shortURL] = {
    longURL,
    userID
  };

  res.redirect(`./urls/${shortURL}`);
});


//delete an entry
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {
      errorMessage: "ERROR - 403 - User must be logged in to delete URLs",
      user: null
    };
    res.status('403');
    return res.render("no_access", templateVars);
  }

  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId);
  const shortURL = req.params.id;

  for (let key in userURLs) {
    if (shortURL === key) {
      delete urlDatabaseObject[req.params.id];
      res.redirect("/urls");
    }
  }

  const templateVars = {
    errorMessage: "ERROR - 403 - User can only delete their own URLs. Please login to another account to access.",
    user: users[userId]
  };
  res.status('403');
  return res.render("no_access", templateVars);
});


//new URL submission page
app.get("/urls/new", (req, res) => {
  
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

  const userId = req.session.user_id;
  const templateVars = {
    user: users[userId],
    urls: urlDatabaseObject
  };
  res.render("urls_new", templateVars);
});



//redirects to external site
app.get("/u/:id", (req, res) => {

  if (!urlDatabaseObject[req.params.id]) {
    const templateVars = {
      errorMessage: "ERROR - 404 - This short URL doesn't exist in our database. Please try again",
      user: null
    };
    res.status('404');
    return res.render("no_access", templateVars);
  }

  const shortURL = req.params.id;
  const longURL = urlDatabaseObject[shortURL].longURL;
  res.redirect(longURL);
});


//changes longURL entry
app.post("/urls/:id", (req, res) => {

  if (!req.session.user_id) {
    const templateVars = {
      errorMessage: "ERROR - 403 - User must be logged in to change URLs",
      user: null
    };
    res.status('403');
    return res.render("no_access", templateVars);
  }

  if (!urlDatabaseObject[req.params.id]) {
    const templateVars = {
      errorMessage: "ERROR - 404 - This short URL doesn't exist in our database. Please try again",
      user: null
    };
    res.status('404');
    return res.render("no_access", templateVars);
  }

  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId);
  const shortURL = req.params.id;

  for (let key in userURLs) {
    if (shortURL === key) {
      const newLongURL = req.body.longURL;
      urlDatabaseObject[shortURL].longURL = newLongURL;
      return res.redirect("/urls");
    }
  }

  const templateVars = {
    errorMessage: "ERROR - 403 - User can only view their own URLs. Please login to another account to access.",
    user: users[userId]
  };
  res.status('403');
  return res.render("no_access", templateVars);

});


//Show short urls page
app.get("/urls/:id", (req, res) => {

  if (!req.session.user_id) {
    const templateVars = {
      errorMessage: "ERROR - 403 - User must be logged in to view URLs. Please login or register for an account.",
      user: null
    };
    res.status('403');
    return res.render("no_access", templateVars);
  }

  if (!urlDatabaseObject[req.params.id]) {
    const templateVars = {
      errorMessage: "ERROR - 404 - This short URL doesn't exist in our database. Please try again",
      user: null
    };
    res.status('404');
    return res.render("no_access", templateVars);
  }



  const userId = req.session.user_id;
  const userURLs = urlsForUser(userId);
  const shortURL = req.params.id;

  for (let key in userURLs) {
    if (shortURL === key) {
      const templateVars = {
        user: users[userId],
        shortURL,
        longURL: userURLs[shortURL].longURL
 
      };
      return res.render("urls_show", templateVars);
    }
  }
  const templateVars = {
    errorMessage: "ERROR - 403 - User can only view their own URLs. Please login to another account to access.",
    user: users[userId]
  };
  res.status('403');
  return res.render("no_access", templateVars);
});


//Shows login form
app.get("/login", (req, res) => {

  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
    urls: urlDatabaseObject
  };

  return res.render("login_form", templateVars);
});


//login form submission
app.post("/login", (req, res) => {
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;

  let userObject = getUserByEmail(enteredEmail, users);

  if (!userObject) {
    const templateVars = {
      errorMessage: "ERROR - 403 - Email not in database.",
      user: null
    };
    res.status('403');
    return res.render("no_access", templateVars);
  }

  const hashedPassword = users[userObject.id].password;
  if (bcrypt.compareSync(enteredPassword, hashedPassword)) {
    req.session.user_id = userObject.id;
  }

  if (!req.session.user_id) {
    const templateVars = {
      errorMessage: "ERROR - 403 - Incorrect Password. Please try again.",
      user: null
    };
    res.status('403');
    return res.render("no_access", templateVars);
  }
  res.redirect("/urls");
});



//log out
app.post("/logout", (req, res) => {
  if (req.session.user_id) {
    req.session = null;
    res.redirect("/urls");
  }
});


//registration page
app.get("/register", (req, res) => {

  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
    urls: urlDatabaseObject
  };
  return res.render("registration", templateVars);
});


app.post("/register", (req, res) => {
  if (req.body.email === '') {
    const templateVars = {
      errorMessage: "ERROR - 400 - Please enter a valid email address.",
      user: null
    };
    res.status('400');
    return res.render("no_access", templateVars);
  }

  if (req.body.password === '') {
    const templateVars = {
      errorMessage: "ERROR - 400 - Please create a unique password.",
      user: null
    };
    res.status('400');
    return res.render("no_access", templateVars);
  }

  const usernameExists = getUserByEmail(req.body.email, users);

  if (usernameExists) {
    const templateVars = {
      errorMessage: "ERROR - 400 - User email already exists. Contact us for a replacement password (or try some golden oldies).",
      user: null
    };
    res.status('400');
    return res.render("no_access", templateVars);
  }

  const newUserId = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUserObject = {
    id: newUserId,
    email: req.body.email,
    password: hashedPassword
  };

  users[newUserId] = newUserObject;

  req.session.user_id = newUserId;
  res.redirect("/urls");
});
