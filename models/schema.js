const mongoose = require("mongoose");

const snapshotSchema = new mongoose.Schema({
    url: String,
    date: { type: Date, default: Date.now }
});

const Snapshot = mongoose.model('Snapshot', snapshotSchema);

module.exports = Snapshot;