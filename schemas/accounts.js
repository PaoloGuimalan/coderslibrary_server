const mongoose = require("mongoose");

const accountsSchema = mongoose.Schema({
    userName: {type: mongoose.Schema.Types.Mixed, required: true},
    firstName: {type: mongoose.Schema.Types.Mixed, required: true},
    lastName: {type: mongoose.Schema.Types.Mixed, required: true},
    email: {type: mongoose.Schema.Types.Mixed, required: true},
    password: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model("Accounts", accountsSchema, "accounts");