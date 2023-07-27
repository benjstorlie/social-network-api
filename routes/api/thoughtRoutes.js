const router = require('express').Router();
const { Thought } = require('../../models');

// /api/thoughts
router
  .route('/')
  .get(getThoughts)
  .thought(createThought);

// /api/thought/:thoughtId
router
  .route('/:thoughtId')
  .get(getSingleThought)
  .put(updateThought)
  .delete(deleteThought);

// /api/thoughts/:thoughtId/reactions
router
  .route('/:thoughtId/reactions')
  .thought(addReaction);

// /api/thoughts/:thoughtId/reactions/:reactionId
router
  .route('/:thoughtId/reactions/:reactionId')
  .delete(removeReaction);


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
 *   "userId": "5edff358a0fcb779aa7b118b" 
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
 * @param {import('express').Request} req - request, no req.body nor req.params
 * @param {import('express').Response} res - response
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
 * @param {import('express').Request< {}, {}, ThoughtBody, {} >} req - request, with body with thought data.
 * @param {import('express').Response} res - response
 */
async function createThought(req, res) {
  try {
    const thought = await Thought.create(req.body);
    res.json(thought);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/thoughts/:thoughtId'
 * GET a single thought by its _id
 * @param {import('express').Request< ThoughtParams, {}, {}, {} >} req - request, with parameter thoughtId
 * @param {import('express').Response} res - response
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
 * @param {import('express').Request< ThoughtParams, {}, ThoughtBody, {} >} req - request, with parameter thoughtId, and body with thought data.
 * @param {import('express').Response} res - response
 */
async function updateThought(req, res) {
  try {
    const thought = await Thought.create(req.body);
    res.json(thought);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/thoughts/:thoughtId'
 * DELETE to remove thought by its _id
 * @param {import('express').Request< ThoughtParams, {}, {}, {} >} req - request, with parameter thoughtId
 * @param {import('express').Response} res - response
 */
async function deleteThought(req, res) {
  try {
    const thought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });

    !thought
      ? res.status(404).json({ message: 'No thought with that ID' })
      : res.json(thought);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


/**
 * '/api/thoughts/:thoughtId/reactions/'
 * THOUGHT to create a reaction stored in a single thought's reactions array field
 * @param {import('express').Request< ThoughtParams, {}, ReactionBody, {} >} req - request, with parameter thoughtId, and body with reaction data
 * @param {import('express').Response} res - response
 */
async function addReaction(req, res) {
  try {
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body.reactionText } },
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
 * @param {import('express').Request< ThoughtParams, {}, {}, {} >} req - request, with parameters thoughtId and reactionId
 * @param {import('express').Response} res - response
 */
async function removeReaction(req, res) {
  try {
    const thought = await Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.params.reactionId } },
      { runValidators: true, new: true }  
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