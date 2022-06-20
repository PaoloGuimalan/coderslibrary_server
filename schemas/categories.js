const mongoose = require("mongoose")

const categoriesSchema = mongoose.Schema({
    category: {type: mongoose.Schema.Types.Mixed, required: true},
    img_prev: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("Categories", categoriesSchema, "categories")