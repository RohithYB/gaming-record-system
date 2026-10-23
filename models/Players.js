const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  game: { type: String, required: true },
  level: { type: Number, required: true }
});

module.exports = mongoose.model("Player", playerSchema);