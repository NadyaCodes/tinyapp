const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// const res = require('express/lib/response');

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

function generateRandomString() {
  let randomString = "";
  const stringOptions = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  for (let i = 0; i < 6; i++) {
    randomString += stringOptions[Math.floor(Math.random() * stringOptions.length)]
  }
  return randomString;
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
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

//creates a new entry
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  let longURL = req.body.longURL;
  Object.assign(urlDatabase, { [shortURL] : longURL });
  const newVars = { 
    shortURL, 
    longURL,
    username: req.cookies["username"]
   };
  res.render("urls_show", newVars)

})

//delete an entry
app.post("/u/:shortURL/delete", (req, res) => {
  console.log("urlDatabase[req.params.shortURL]:", urlDatabase[req.params.shortURL])
  delete urlDatabase[req.params.shortURL];
  const newTemplateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", newTemplateVars)
})


app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_new", templateVars);
});



//redirects to external site
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
})

//changes longURL entry
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  let longURL = req.body.longURL;
  Object.assign(urlDatabase, { [shortURL] : longURL });
  const updatedDatabase = { 
    shortURL, 
    longURL,
    username: req.cookies["username"]
  };
  res.render("urls_show", updatedDatabase)
})


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//set a username
app.post("/login", (req, res) => {
  const newUser = req.body.username;
  res.cookie("username", newUser)
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.redirect("/urls");
  // res.render("urls_index", templateVars);
})

//log out
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
})


//registration page
app.get("/register", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("registration", templateVars);
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