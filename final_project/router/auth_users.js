const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"dennis","password":"abc"}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    const userMatches = users.filter((user) => user.username === username);
    return userMatches.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}



//only registered users can login

regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in. Username and password are required." });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,
      username
    }
    return res.status(200).json({ message: "User successfully logged in", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn]


  // Check if the user is authenticated
  if (!req.session.authorization || !req.session.authorization.username) {
    return res.status(401).json({ message: "Unauthorized. Please log in to post a review." });
  }

  const username = req.session.authorization.username;
  const review = req.body.review;

  // Check if the book exists in the database
  if (book) {
    // Check if a review already exists for the given ISBN under the current user's name
    if (book.reviews[username]) {
      // Modify the existing review
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully." });
    } else {
      // Add a new review under the current user's name
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully." });
    }
  } else {
    return res.status(404).json({ message: "Book not found for the specified ISBN." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn]) {
      let book = books[isbn];
      delete book.reviews[username];
      return res.status(200).send("Review successfully deleted");
  }
  else {
      return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;