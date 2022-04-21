const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10)
const { getUserByEmail } = require('./helpers.js')
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['This is my first key'],
}))
// const res = require('express/lib/response');


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

app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// }

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

}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  } else {
    return res.redirect("/login")
  }
});


// THIS IS THE ONE I DON'T KNOW IF I NEED
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// })

//FROM ZOOM CHAT
// app.get("/u/:shortURL", (req, res) => {
//   const shortURL = req.params.shortURL;
//   const longURL = urlDatabase[shortURL];
//   res.redirect(longURL);
// });


app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { 
      errorMessage: "ERROR - 403 - User must be logged in to view URLs. Please login or register for an account.",
      user: null
    }
    res.status('403')
    return res.render("no_access", templateVars)
  }

  // console.log("in /urls get request")

  const userId = req.session.user_id
  
  // console.log("user: ", user)
  // console.log("userId:", userId)
  // console.log("urlDatabaseObject3:", urlDatabaseObject)
  let userURLs = urlsForUser(userId);
  

  // console.log("userURLs: ", userURLs)

  const templateVars = {
    // username: req.cookies["username"],
    user: users[userId],
    urls: userURLs
  };

  // console.log(templateVars)
  return res.render("urls_index", templateVars);
});


//creates a new entry
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { 
      errorMessage: "ERROR - 403 - User must be logged in to submit URLs",
      user: null
    }
    res.status('403')
    return res.render("no_access", templateVars)
  }

  // console.log("in /urls post request")
  const shortURL = generateRandomString()
  const longURL = req.body.longURL;
  const userID = req.session.user_id

  urlDatabaseObject[shortURL] = {
    longURL,
    userID
  }

  let userURLs = urlsForUser(userID);

  const templateVars = {
    // username: req.cookies["username"],
    user: users[userID],
    urls: userURLs,
    shortURL,
    longURL
  };

  // console.log("templateVars: ", templateVars)

  // console.log(urlDatabaseObject)
  return res.render("urls_show", templateVars)

})


//delete an entry 
app.post("/u/:shortURL/delete", (req, res) => {  
  if (!req.session.user_id) {
    const templateVars = { 
      errorMessage: "ERROR - 403 - User must be logged in to delete URLs",
      user: null
    }
    res.status('403')
    return res.render("no_access", templateVars)
  }

  delete urlDatabaseObject[req.params.shortURL];


  const userId = req.session.user_id
  
  let userURLs = urlsForUser(userId);
  

  const newTemplateVars = {
    user: users[userId],
    urls: userURLs
  };
  res.render("urls_index", newTemplateVars)
})


//new URL submission page
app.get("/urls/new", (req, res) => {
  
  if (!req.session.user_id) {
    return res.redirect("/login");
  }

// userURLs = findMyURLs(req.cookies["user_id"].id, urlDatabaseObject)

  // const newVars = {
  //   user: req.cookies["user_id"],
  //   shortURL,
  //   longURL
  // };
  // const templateVars = {
  //   // username: req.cookies["username"],
  //   user: req.cookies["user_id"],
  //   urls: userURLs,
  //   shortURL,
  //   longURL
  // };
  const userId = req.session.user_id
  const templateVars = {
    // username: req.cookies["username"],
    user: users[userId],
    urls: urlDatabaseObject
  };

  // console.log(userURLs);
  res.render("urls_new", templateVars);
});



//redirects to external site
app.get("/u/:shortURL", (req, res) => {

            // req.session.user_id = newUserId
  // console.log(req.session.user_id)
  if (!req.session.user_id) {
    const userID = req.session.user_id
    const templateVars = { 
      errorMessage: "ERROR - 403 - User must be logged in to view URLs. Please login or register for an account.",
      user: users[userID]
    }
    res.status('403')
    return res.render("no_access", templateVars)
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabaseObject[shortURL].longURL;
  res.redirect(longURL);
})


//changes longURL entry SHOULD ALSO PREVENT OTHER LOGGED INS TO ACCESS THIS
app.post("/urls/:shortURL", (req, res) => {

  if (!req.session.user_id) {
    const templateVars = { 
      errorMessage: "ERROR - 403 - User must be logged in to change URLs",
      user: null
    }
    res.status('403')
    return res.render("no_access", templateVars)
  }

  const shortURL = req.params.shortURL
  const newLongURL = req.body.longURL
  const userId = req.session.user_id

  urlDatabaseObject[shortURL].longURL = newLongURL

  // const updatedDatabase = {
  //   shortURL,
  //   longURL: newLongURL,
  //   user: users[userId],
  // };
  return res.redirect("/urls")
})


//Show short urls page 
app.get("/urls/:shortURL", (req, res) => {

  if (!req.session.user_id) {
    const templateVars = { 
      errorMessage: "ERROR - 403 - User must be logged in to view URLs. Please login or register for an account.",
      user: null
    }
    res.status('403')
    return res.render("no_access", templateVars)
  }

  if (!urlDatabaseObject[req.params.shortURL]) {
    const templateVars = { 
      errorMessage: "ERROR - 404 - This short URL doesn't exist in our database. Please try again",
      user: null
    }
    res.status('404')
    return res.render("no_access", templateVars)
  }


  const userId = req.session.user_id
  const userURLs = urlsForUser(userId)
  const shortURL = req.params.shortURL

  // console.log(users[userId]);

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
  }
  return res.render("no_access", templateVars)
});


//Shows login form 
app.get("/login", (req, res) => {

    // req.session.user_id = newUserId
  // console.log(req.session.user_id)

  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
    urls: urlDatabaseObject
  };

  return res.render("login_form", templateVars);
})


//login form submission
app.post("/login", (req, res) => {
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;

  let userObject = getUserByEmail(enteredEmail, users);

  if (!userObject) {
    const templateVars = { 
      errorMessage: "ERROR - 403 - Email not in database.",
      user: null
    }
    res.status('403')
    return res.render("no_access", templateVars)
  }

  const hashedPassword = users[userObject.id].password
  if (bcrypt.compareSync(enteredPassword, hashedPassword)) {
    req.session.user_id = userObject.id;
  }

  if (!req.session.user_id) {
    const templateVars = { 
      errorMessage: "ERROR - 403 - Incorrect Password. Please try again.",
      user: null
    }
    res.status('403')
    return res.render("no_access", templateVars)
  }

  // console.log(req.session.user_id)
  // res.cookie("user_id", user)
  res.redirect("/urls");
})



//log out
app.post("/logout", (req, res) => {

  ///or delete req.session.user_id
  if (req.session.user_id) {
  req.session = null;
  res.redirect("/urls");
  }
})


//registration page 
app.get("/register", (req, res) => {
  // req.session.user_id = newUserId
  // console.log(req.session.user_id)
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  // req.session.user_id = null;
  // const userId = req.session.user_id
  // const userObject = users[userId]

  const templateVars = {
    user: null,
    urls: urlDatabaseObject
  };
  return res.render("registration", templateVars);
})


app.post("/register", (req, res) => {
  if (req.body.email === '') {
    const templateVars = { 
      errorMessage: "ERROR - 400 - Please enter a valid email address.",
      user: null
    }
    res.status('400')
    return res.render("no_access", templateVars)
  }

  if (req.body.password === '') {
    const templateVars = { 
      errorMessage: "ERROR - 400 - Please create a unique password.",
      user: null
    }
    res.status('400')
    return res.render("no_access", templateVars)
  }

  const usernameExists = getUserByEmail(req.body.email, users);

  if (usernameExists) {
    const templateVars = { 
      errorMessage: "ERROR - 400 - User email already exists. Contact us for a replacement password (or try some golden oldies).",
      user: null
    }
    res.status('400')
    return res.render("no_access", templateVars)
  }

  const newUserId = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUserObject = {
    id: newUserId,
    email: req.body.email,
    password: hashedPassword
  }

  users[newUserId] = newUserObject;

  req.session.user_id = newUserId
  // console.log(req.session.user_id)

  // res.cookie("user_id", newUserObject)
  res.redirect("/urls");
})





//This page probably not needed
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n")
// });



// THESE WERE HERE AS A DEMONSTRATION THAT VARIABLES AREN'T PASSED ALONG
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });


// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });