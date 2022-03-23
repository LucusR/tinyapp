const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}), cookieParser());


function generateRandomString() {
return Math.random().toString(36).slice(-6)
}

const urlDatabase = {
  "b2xVn2": "www.lighthouselabs.ca",     //try to make sure data is stored in the same format (HTTP://)
  "9sm5xk": "www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {      
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect('http://localhost:8080/urls/' + randomURL)
});

app.post("/login", (req, res) => {                               //login
  let username = req.body.username;
  res.cookie("username", username)
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {  
  let username = req.body.username                             //logout
  res.clearCookie("username", username)
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {                //deletes URL
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:newURL", (req, res) => {                         //edits URL
  let shortURL = req.params.newURL
  urlDatabase[shortURL] = req.body.newURL
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect('http://' + longURL);                           //includes http:// - this won't work if link already includes it
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log('Example app listening on port ${PORT}!');
});