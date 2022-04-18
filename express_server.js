const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
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

//THIS IS THE NEW ONE THAT I DON'T KNOW IF IT REPLACES ABOVE



app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  // req.body.shortURL = generateRandomString();
  // console.log(req.body)
  let shortURL = generateRandomString()
  let longURL = req.body.longURL;
  Object.assign(urlDatabase, { [shortURL] : longURL }),
  res.send("Ok");
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


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