const express = require("express");
const PORT = 8080; //default port 8080;
const morgan = require("morgan");
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");


const app = express();
app.use(morgan('dev'));
app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


//helper functions
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");


const urlDatabase = {
  b2xVn2: {
    longURL: "www.lighthouselabs.ca",
    id: "aJ48lw"
  },
};

const users = {
  "aJ48lw": {
    id: "aJ48lw",
    email: "user@example.com",
    password: "test1"
  },
};

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});


// creates tinyURL
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const randomURL = generateRandomString();
    urlDatabase[randomURL] = {
      longURL: req.body.longURL,
      id: req.session.user_id
    };
    res.redirect(`/urls/${randomURL}`);
  } else {
    res.status(401).send("You must be logged in to create short URLS");
  }
});

  
//registers new user
app.post("/register", (req, res) => {

  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  
  
  if ([newUserEmail && newUserPassword].includes('')) {
    res.status(400).send("Email and/or password cannot be left empty!");
  } else if (getUserByEmail(newUserEmail, users)) {
    res.status(400).send("Email already in use.");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: newUserEmail,
      password: bcrypt.hashSync(newUserPassword, 10)
    };
    req.session.user_id = newUserID;
    res.redirect('/urls');
  }
});
  
app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

//login
app.post("/login", (req, res) => {
  
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const userID = getUserByEmail(loginEmail, users);
  
  if (!getUserByEmail(loginEmail, users)) {
    res.status(403).send("This account does not exist!");
  } else {
    if (!bcrypt.compareSync(loginPassword, users[userID].password)) {
      res.status(403).send("Incorrect password");
    } else {
      req.session.user_id = userID;
      res.redirect('/urls');
      console.log(users);
    }
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const removableURLS = urlsForUser(req.session.user_id, urlDatabase);
  if (Object.keys(removableURLS).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("Only the creator can modify this URL.");
  }
});

//edits URL if user is logged in and owns the shortURL
app.post("/urls/:newURL", (req, res) => {
  const editableURLS = urlsForUser(req.session.user_id, urlDatabase);
  if (Object.keys(editableURLS).includes(req.params.newURL)) {
    const shortURL = req.params.newURL;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("Only the creator can modify this URL.");
  }
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      urlUserID: urlDatabase[req.params.shortURL].id,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("This short URL does not exist!")
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect('http://' + longURL);                           
});

app.listen(PORT, () => {
  console.log('Example app listening on port ${PORT}!');
});