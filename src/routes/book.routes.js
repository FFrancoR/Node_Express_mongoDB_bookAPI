const express = require("express")
const router = express.Router()
const Book = require("../models/book.model")

//MIDDLEWARE
const getBook = async (req, res, next) => {
    let book;
    const {id} = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({message: "El id del libro no es valido"})
    }
    try {
        book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({message: "El libro no fue encontrado"})
        }
    } catch (e) {
        res.status(500).json({message: e.message})
    }
    res.book = book;
    next()
}

//GET ALL
router.get("/", async (req, res) => {
    try {
        const books = await Book.find()
        console.log("GET ALL", books)
        if (books.length === 0) {
            return res.status(204).json([])
        }
        res.json(books)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//GET BY ID
router.get("/:id", getBook, async (req, res) => {
    res.json(res.book)
})

//POST
router.post("/", async (req, res) => {
    const {title, author, genre, publicationDate} = req?.body
    if (!title || !author || !genre || !publicationDate) {
        return res.status(400).json({message: "Los campos title, author, genre, publicationDate son obligatorios"})
    }
    const book = new Book({
        title,
        author,
        genre,
        publicationDate
    })
    try {
        const newBook = await book.save()
        console.log(newBook)
        res.status(201).json(newBook)
    } catch (e) {
        res.status(400).json({message: e.message})
    }


})

//PUT
router.put("/:id", getBook, async (req, res) => {
    try {
        const book = res.book;
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publicationDate = req.body.publicationDate || book.publicationDate;

        const updatedBook = await book.save()
        res.json(updatedBook)
    } catch (e) {
        res.status(400).json({message: e.message})
    }
})

//PATCH
router.patch("/:id", getBook, async (req, res) => {

    if (!req.body.title && !req.body.author && !req.body.genre && !req.body.publicationDate) {
        res.status(400).json({message: "al menos uno de estos campos debe ser enviado: titulo, autor, genero o fecha de publicacion"})
    }

    try {
        const book = res.book;
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publicationDate = req.body.publicationDate || book.publicationDate;

        const updatedBook = await book.save()
        res.json(updatedBook)
    } catch (e) {
        res.status(400).json({message: e.message})
    }
})

//DELETE
router.delete("/:id", getBook, async (req, res) => {
    try {
        const book = res.book;
        await book.deleteOne({_id:book._id});
        res.json({message: "El libro " + book.title + " ha sido eliminado correctamente"})
    } catch (e) {
        res.status(500).json({message: e.message})
    }
})

module.exports = router