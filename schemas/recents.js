const mongoose = require("mongoose");

const recentsSchema = mongoose.Schema({
    userName: {type: mongoose.Schema.Types.Mixed, required: true},
    bookID: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("Recents", recentsSchema, "recents")