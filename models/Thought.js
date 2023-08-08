const mongoose = require('mongoose');

// dayjs for formatting dates
const dayjs = require('dayjs');

function timestamp(date) {
  return dayjs(date).format("h:mma [on] D MMM YYYY");
}

// Schemas define the shape of the documents within the collection.
const reactionSchema = new mongoose.Schema(
    {
    reactionId: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
    },
    username: {
      type: String, 
      required: true 
    },
    reactionBody: {
      type: String,
      required: true,
      maxlength: 280,
    },
    createdAt: { 
      type: Date, 
      default: Date.now, 
      get: timestamp
    },
  },
  {
    toJSON: {
      getters: true
    }
  }
);

const thoughtSchema = new mongoose.Schema(
    {
    thoughtText: {
      type: String,
      required: true,
      maxLength: 280,
    },
    createdAt: { 
      type: Date, 
      default: Date.now,
      get: timestamp, 
    },
    // This user will have its own array of Thoughts, containing this thought's _id.
    username: {
      type: String,
      required: true,
    },
    reactions: [reactionSchema],
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    id: false,
  }
);

thoughtSchema
  .virtual('reactionCount')
  // Getter
  .get(function() {
    return this.reactions.length
  });




// Initialize Thought model
const Thought = mongoose.model('thought', thoughtSchema);

module.exports = Thought;