const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// const res = require('express/lib/response');

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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
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

function findMatchingEmail(usersObject, email) {
  for (let id in usersObject) {
    if (usersObject[id].email === email) {
      return true;
    }
  }
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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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
  if (!req.cookies["user_id"]) {
    const templateVars = { 
      errorMessage: "ERROR - 403 - User must be logged in to view URLs. Please register for an account.",
      user: req.cookies["user_id"]
    }
    return res.render("no_access", templateVars)
  }

  // console.log("in /urls get request")

  const userId = req.cookies["user_id"].id
  
  // console.log("user: ", user)
  // console.log("userId:", userId)
  // console.log("urlDatabaseObject3:", urlDatabaseObject)
  let userURLs = urlsForUser(userId);
  

  // console.log("userURLs: ", userURLs)

  const templateVars = {
    // username: req.cookies["username"],
    user: req.cookies["user_id"],
    urls: userURLs
  };

  // console.log(templateVars)
  return res.render("urls_index", templateVars);
});


//creates a new entry
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status('403').send('ERROR - 403 - User must be logged in to submit URLs')
  }

  console.log("in /urls post request")
  const shortURL = generateRandomString()
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"].id


  urlDatabaseObject[shortURL] = {
    longURL,
    userID
  }

  // const userURLs = findMyURLs(userId, urlDatabaseObject)

  // const newVars = {
  //   user: req.cookies["user_id"],
  //   shortURL,
  //   longURL
  // };
  const templateVars = {
    // username: req.cookies["username"],
    user: req.cookies["user_id"],
    urls: urlDatabaseObject,
    shortURL,
    longURL
  };

  // console.log(urlDatabaseObject)
  return res.render("urls_show", templateVars)

})


//delete an entry 
app.post("/u/:shortURL/delete", (req, res) => {  
  delete urlDatabaseObject[req.params.shortURL];
  const newTemplateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabaseObject
  };
  res.render("urls_index", newTemplateVars)
})


//new URL submission page
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  console.log("in /urls/new get request")

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
  const templateVars = {
    // username: req.cookies["username"],
    user: req.cookies["user_id"],
    urls: urlDatabaseObject
  };

  // console.log(userURLs);
  res.render("urls_new", templateVars);
});



//redirects to external site
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabaseObject[shortURL].longURL;
  res.redirect(longURL);
})


//changes longURL entry
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const newLongURL = req.body.longURL

  urlDatabaseObject[shortURL].longURL = newLongURL

  const updatedDatabase = {
    shortURL,
    longURL: newLongURL,
    user: req.cookies["user_id"],
  };
  res.render("urls_show", updatedDatabase)
})


//Show short urls page
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabaseObject[req.params.shortURL]) {
    return res.status('404').send('ERROR - 404 - This short URL doesn\'t exist in our database. Please try another')
  }

  // const userId = eq.cookies["user_id"].id
  // const userURLs = urlsForUser(userId)

  // for (let i = )

  const shortURL = req.params.shortURL
  const templateVars = {
    user: req.cookies["user_id"],
    shortURL,
    longURL: urlDatabaseObject[shortURL].longURL
  };
  return res.render("urls_show", templateVars);
});


//Shows login form
app.get("/login", (req, res) => {

  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabaseObject
  };

  return res.render("login_form", templateVars);
})


//login form submission
app.post("/login", (req, res) => {
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;
  let user;
  if (!findMatchingEmail(users, enteredEmail)) {
    res.status('403').send('ERROR - 403 - Email not in database.')
    return;
  }

  if (findMatchingEmail(users, req.body.email)) {
    for (let id in users) {
      if ((users[id].email === enteredEmail) && (users[id].password === enteredPassword)) {
        user = users[id]
      }
    }
  }

  if (!user) {
    res.status('403').send('ERROR - 403 - Incorrect Password. Please try again.')
    return;
  }
  res.cookie("user_id", user)
  res.redirect("/urls");
})



//log out
app.post("/logout", (req, res) => {
  if (req.cookies["user_id"]) {
  res.clearCookie("user_id")
  res.redirect("/urls");
  }
})


//registration page
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: req.cookies["user_id"],
    urls: urlDatabaseObject
  };
  return res.render("registration", templateVars);
})


app.post("/register", (req, res) => {
  if (req.body.email === '') {
    res.status('400').send('ERROR - 400 - Please enter a valid email address')
    return;
  }

  if (req.body.password === '') {
    res.status('400').send('ERROR - 400 - Please create a unique password')
    return;
  }

  if (findMatchingEmail(users, req.body.email)) {
    res.status('400').send('ERROR - 400 - User email already exists. Contact us for a replacement password (or try some golden oldies).')
    return;
  }

  const newUserId = generateRandomString();

  const newUserObject = {
    id: newUserId,
    email: req.body.email,
    password: req.body.password
  }

  users[newUserId] = newUserObject;

  res.cookie("user_id", newUserObject)
  res.redirect("/urls");
})





//This page probably not needed
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});



// THESE WERE HERE AS A DEMONSTRATION THAT VARIABLES AREN'T PASSED ALONG
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });


// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });