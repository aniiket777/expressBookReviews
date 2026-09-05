const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Register
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Unable to register user."
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: "User already exists!"
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(200).json({
        message: "User successfully registered. Now you can login"
    });
});


// Q2 - Get all books
public_users.get('/', async (req, res) => {
    try {
        const result = await Promise.resolve(books);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books"
        });
    }
});


// Q3 - Get book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = await Promise.resolve(books[isbn]);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        return res.status(200).json({
            [isbn]: book
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving book"
        });
    }
});


// Q4 - Get books by author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const result = {};

        for (let isbn in books) {
            if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                result[isbn] = books[isbn];
            }
        }

        if (Object.keys(result).length === 0) {
            return res.status(404).json({
                message: "No books found by this author"
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books"
        });
    }
});


// Q5 - Get books by title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const result = {};

        for (let isbn in books) {
            if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                result[isbn] = books[isbn];
            }
        }

        if (Object.keys(result).length === 0) {
            return res.status(404).json({
                message: "No books found with this title"
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving books"
        });
    }
});


// Q6 - Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    return res.status(200).json(book.reviews);
});


// Axios-based helper functions for the async requirement

async function getAllBooks() {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
}

async function getBookByISBN(isbn) {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return response.data;
}

async function getBooksByAuthor(author) {
    const response = await axios.get(
        `http://localhost:5000/author/${encodeURIComponent(author)}`
    );
    return response.data;
}

async function getBooksByTitle(title) {
    const response = await axios.get(
        `http://localhost:5000/title/${encodeURIComponent(title)}`
    );
    return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;