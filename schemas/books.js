const mongoose = require("mongoose");

const booksSchema = mongoose.Schema({
    id: {type: mongoose.Schema.Types.Mixed, required: true},
    category: {type: mongoose.Schema.Types.Mixed, required: true},
    name: {type: mongoose.Schema.Types.Mixed, required: true},
    author: {type: mongoose.Schema.Types.Mixed, required: true},
    publisher: {type: mongoose.Schema.Types.Mixed, required: true},
    link_img: {type: mongoose.Schema.Types.Mixed, required: true},
    date_added: {type: mongoose.Schema.Types.Mixed, required: true},
    link_dl: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("Books", booksSchema, "books")