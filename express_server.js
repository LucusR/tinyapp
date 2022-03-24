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

//function to see if email exists in database
function checkEmail(email, database) {
  for (let ii in database) {
    if (database[ii].email === email) {
      return true;
    }
  }
  return false;
}

//function to see if password matches
function checkPassword(password, database) {
  for (let i in database) {
    if (database[i].password === password) {
      return true;
    }
  }
  return false;
}

//function to get userID from email
function checkUserId(email, database) {
  for (let iii in database) {
    if (database[iii].email === email) {
      return database[iii].id
    }
  }
};

const urlDatabase = {
  "b2xVn2": "www.lighthouselabs.ca",     //try to make sure data is stored in the same format (HTTP://)
  "9sm5xk": "www.google.com"
};

const users = {
  "exampleUser1": {
    id: "exampleUser1",
    email: "user@example.com",
    password: "test1"
  },
  "exampleUser2": {
    id: "exampleUser2",
    email: "user2@example.com",
    password: "test2"
  }
}

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    users,
    user: req.cookies["user"]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {      
  const randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  res.redirect('http://localhost:8080/urls/' + randomURL)
});

//registers new user
app.post("/register", (req, res) => {      

  const newUserEmail = req.body.username;
  const newUserPassword = req.body.password;
  const newUserID = generateRandomString();
  
  if ([newUserEmail && newUserPassword].includes('')) {
    res.status(400).send("Email and/or password cannot be left empty!")
  } else if (checkEmail(newUserEmail, users)) {
    res.status(400).send("Email already in use.")
  } else {
   users[newUserID] = {
   id: `user${newUserID}`,
   email: newUserEmail,
   password: newUserPassword
   };
  res.cookie("user", users[newUserID]); 
  res.redirect('/urls');
    }
  });
  
  app.get("/register", (req, res) => {
    const templateVars = { 
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL],
      users,
      user: req.cookies["user"]
    };
    res.render("urls_register", templateVars);
  });

 //login
app.post("/login", (req, res) => {       
  
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  const user_id = checkUserId(loginEmail, users)
  
  if (!checkEmail(loginEmail, users)) {
    res.status(403).send("This account does not exist!")
  } else if (!checkPassword(loginPassword, users)) {
    res.status(403).send("Password is incorrect. Please try again!")
  } else {
    res.cookie("user")
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    user: req.cookies["user"]
  };
  res.render("urls_login", templateVars);
});

//logout
app.post("/logout", (req, res) => {                             
  res.clearCookie("user")
  res.redirect('/urls');
});

  //deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {              
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

 //edits URL
app.post("/urls/:newURL", (req, res) => {                        
  let shortURL = req.params.newURL
  urlDatabase[shortURL] = req.body.newURL
  res.redirect('/urls');
});

//includes http:// - this won't work if link already includes it
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect('http://' + longURL);                           
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
    users,
    user: req.cookies["user"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    user: req.cookies["user"]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log('Example app listening on port ${PORT}!');
});