const mongoose = require('mongoose');

// A Group is a private league — a set of users competing against each other.
// Each group has a unique 6-character invite code that the creator can share.
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40,
    },
    // Short alphanumeric code used to invite others, e.g. "X7K2PQ"
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // All members including the creator
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
