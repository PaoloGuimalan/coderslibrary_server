const mongoose = require("mongoose");

const tagsSchema = mongoose.Schema({
    userName: {type: mongoose.Schema.Types.Mixed, required: true}, 
    fullName: {type: mongoose.Schema.Types.Mixed, required: true}, 
    bookID: {type: mongoose.Schema.Types.Mixed, required: true}, 
    content: {type: mongoose.Schema.Types.Mixed, required: true}, 
    dateposted: {type: mongoose.Schema.Types.Mixed, required: true}, 
    timeposted: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("Tags", tagsSchema, "tags")