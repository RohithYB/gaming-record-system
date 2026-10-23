const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genre: { type: String, required: true }
});

module.exports = mongoose.model("Game", gameSchema);