const mongoose = require("mongoose");

const savesSchema = mongoose.Schema({
    userName: {type: mongoose.Schema.Types.Mixed, required: true},
    bookID: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model('Saves', savesSchema, 'saves');