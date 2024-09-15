const mongoose = require('mongoose');


const userSchema = mongoose.Schema({

  username: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  isAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;