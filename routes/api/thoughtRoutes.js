const router = require('express').Router();
const { User, Thought } = require('../../models');

// /api/thoughts
router
  .route('/')
  .get(getThoughts)
  .post(createThought);

// /api/thought/:thoughtId
router
  .route('/:thoughtId')
  .get(getSingleThought)
  .put(updateThought)
  .delete(deleteThought);

// /api/thoughts/:thoughtId/reactions
router
  .route('/:thoughtId/reactions')
  .post(addReaction);

// /api/thoughts/:thoughtId/reactions/:reactionId
router
  .route('/:thoughtId/reactions/:reactionId')
  .delete(removeReaction);

module.exports = router;


// JSDoc Documentation Suggestion [https://stackoverflow.com/a/65108929]
// Install `@types/express` with `npm install --save-dev @types/express`.
// Use custom @typedef to document req.query or req.params

/**
 * @typedef ThoughtParams
 * @prop {String} thoughtId - the thought's id number
 * @prop {String} [reactionId] - the id number of the reaction to delete
*/

/**
 * example data
 * ```
 * { 
 *   "thoughtText": "Here's a cool thought...", 
 *   "username": "lernantino", 
 *   "userId": "64c1d12bfe7308f4c1af95f6" 
 * }
 * ```
 * @typedef ThoughtBody
 * @prop {String} thoughtText - text of the thought, 280 characters max
 * @prop {String} username - username of the thoughting user
 * @prop {String} userId - id of the thoughting user
*/

/**
 * @typedef ReactionBody
 * @prop {String} reactionBody - text of the reaction, 280 characters max
 * @prop {String} username - username of the reacting user
*/

/**
 * '/api/thoughts'
 * GET all thoughts
 * @async
 * @param {import('express').Request} req - request, no req.body nor req.params
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function getThoughts(req,res) {
  try {
    const thoughts = await Thought.find();
    res.json(thoughts);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/thoughts'
 * THOUGHT to create a new thought (don't forget to push the created thought's _id to the associated user's thoughts array field)
 * @async
 * @param {import('express').Request< {}, {}, ThoughtBody, {} >} req - request, with body with thought data.
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function createThought(req, res) {
  try {
    const thought = await Thought.create(req.body);
    const user = await User.findOneAndUpdate(
      { _id: req.body.userId, username:req.body.username },
      { $addToSet: { thoughts: thought._id } },
      { new: true }
    );
    !user
      ? res
        .status(404)
        .json({ message: 'Thought created, but found no user with that ID and username', ...thought._doc })
      : res.status(201).json(thought);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/thoughts/:thoughtId'
 * GET a single thought by its _id
 * @async
 * @param {import('express').Request< ThoughtParams, {}, {}, {} >} req - request, with parameter thoughtId
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function getSingleThought(req, res) {
  try {
    const thought = await Thought.findOne({ _id: req.params.thoughtId })
      .select('-__v');

    !thought
      ? res.status(404).json({ message: 'No thought with that ID' })
      : res.json(thought);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/thoughts/:thoughtId'
 * PUT to update a thought by its _id
 * It only makes sense for the thoughtText field to update, since it should only be the same user doing the updating.
 * @async
 * @param {import('express').Request< ThoughtParams, {}, ThoughtBody, {} >} req - request, with parameter thoughtId, and body with thought data.
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function updateThought(req, res) {
  try {
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { thoughtText: req.body.thoughtText },
      { runValidators: true, new: true }
    );
    res.json(thought);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/thoughts/:thoughtId'
 * DELETE to remove thought by its _id
 * @async
 * @param {import('express').Request< ThoughtParams, {}, {}, {} >} req - request, with parameter thoughtId
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function deleteThought(req, res) {
  try {
    const thought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });

    if (thought) {
      try {
        await User.updateMany(
          { },
          { $pull: { thoughts: req.params.thoughtId } }
        );
        res.json({message: 'Successfully deleted.'})
      } catch {
        res.status(500).json({message: "Deleted thought, but unable to pull the thoughtId from users' thought lists."});
        return;
      }
    } else {
      // Go ahead and delete the id from user's lists in case it's still there.
      await User.updateMany(
        { },
        { $pull: { thoughts: req.params.thoughtId } }
      );
      res.status(404).json({ error: 'No thought with that ID' })
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


/**
 * '/api/thoughts/:thoughtId/reactions/'
 * THOUGHT to create a reaction stored in a single thought's reactions array field
 * @async
 * @param {import('express').Request< ThoughtParams, {}, ReactionBody, {} >} req - request, with parameter thoughtId, and body with reaction data
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function addReaction(req, res) {
  try {
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body } },
      { runValidators: true, new: true }  
    );

    // How to validate whether the user associated with the reaction is real?

    !thought
      ? res.status(404).json({ message: 'No thought with that ID' })
      : res.json(thought);
      
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


/**
 * '/api/thoughts/:thoughtId/reactions/:reactionId' 
 * DELETE to pull and remove a reaction by the reaction's reactionId value
 * @async
 * @param {import('express').Request< ThoughtParams, {}, {}, {} >} req - request, with parameters thoughtId and reactionId
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function removeReaction(req, res) {
  try {
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: {reactionId: req.params.reactionId} } },
      { new: true }  
    );

    // need to check if the reactionId is real

    !thought
      ? res.status(404).json({ message: 'No thought with that ID' })
      : res.json(thought);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}