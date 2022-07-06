const mongoose = require("mongoose")

const notificationsSchema = mongoose.Schema({
    type: {type: mongoose.Schema.Types.Mixed, required: true},
    from: {type: mongoose.Schema.Types.Mixed, required: true},
    to: {type: mongoose.Schema.Types.Mixed, required: true},
    content: {type: mongoose.Schema.Types.Mixed, required: true},
    date: {type: mongoose.Schema.Types.Mixed, required: true},
    time: {type: mongoose.Schema.Types.Mixed, required: true},
    linking: {type: mongoose.Schema.Types.Mixed, required: true}
})

module.exports = mongoose.model('Notifications', notificationsSchema, 'notifications')