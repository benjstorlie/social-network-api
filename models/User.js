const mongoose = require('mongoose');

// Schemas define the shape of the documents within the collection.
const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true,
      unique: true, 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      // Match email regex [Pattern created by 'VeteranKamikaze' from https://regexr.com/3e48o]
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    },
    // Array of _id values referencing the Thought model
    thoughts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'thought',
      },
    ],
    // Array of _id values referencing the User model (self-reference)
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    id: false,
  }
);

userSchema
  .virtual('friendCount')
  // Getter
  .get(function() {
    return this.friends.length
  });


// Initialize User model
const User = mongoose.model('user', userSchema);

module.exports = User;