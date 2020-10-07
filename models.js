var mongoose = require("mongoose");

const Vote = mongoose.model('Vote', { number: Number, date: Date });
const Log = mongoose.model('Log', {
    url: String,
    json: Object,
    date: Date
});

module.exports = { Vote, Log };