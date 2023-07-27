const router = require('express').Router();
const { User, Thought } = require('../models');

// JSDoc Documentation Suggestion [https://stackoverflow.com/a/65108929]
// Install `@types/express` with `npm install --save-dev @types/express`.
// Use custom @typedef to document req.query or req.params

/**
 * @typedef UserParams
 * @prop {Number} userId - the user's id number
 * @prop {Number} [friendId] - the id number of the user's friend to add or delete
*/

/**
 * @typedef UserBody
 * @prop {String} username - the new/updated username
 * @prop {String} email - the new/updated email
*/

/**
 * '/api/users'
 * GET all users
 * @param {import('express').Request} req - request, no req.body nor req.params
 * @param {import('express').Response} res - response
 */
async function getUsers(req,res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
}

/**
 * '/api/users'
 * POST a new user
 * @param {import('express').Request< {}, {}, UserBody, {} >} req - request, with body with user data.
 * @param {import('express').Response} res - response
 */
async function createUser(req, res) {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
}

/**
 * '/api/users/:userId'
 * GET a single user by its _id and populated thought and friend data
 * @param {import('express').Request< UserParams, {}, {}, {} >} req - request, with parameter userId
 * @param {import('express').Response} res - response
 */
async function getSingleUser(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.userId })
      .select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'No user with that ID' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
}

/**
 * '/api/users/:userId'
 * PUT to update a user by its _id
 * @param {import('express').Request< UserParams, {}, UserBody, {} >} req - request, with parameter userId, and body with user data.
 * @param {import('express').Response} res - response
 */
async function updateUser(req, res) {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
}

/**
 * '/api/users/:userId'
 * DELETE to remove user by its _id
 * BONUS: Remove a user's associated thoughts when deleted.
 * @param {import('express').Request< UserParams, {}, {}, {} >} req - request, with parameter userId
 * @param {import('express').Response} res - response
 */
async function deleteUser(req, res) {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.userId });

    if (!user) {
      return res.status(404).json({ message: 'No user with that ID' });
    }

    await Thought.deleteMany({ _id: { $in: user.thoughts } });
    res.json({ message: 'User and associated thoughts deleted!' })
  } catch (err) {
    res.status(500).json(err);
  }
}


/**
 * '/api/users/:userId/friends/:friendId'
 * POST to add a new friend to a user's friend list
 * @param {import('express').Request< UserParams, {}, {}, {} >} req - request, with parameters userId and friendId
 * @param {import('express').Response} res - response
 */
async function addFriend(req, res) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: req.params.friendId } },
      { runValidators: true, new: true }  
    );

    // Do I need runValidators?  I need something to check if the friend is a real user.

    if (!user) {
      return res.status(404).json({ message: 'No user with that ID' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
}


/**
 * '/api/users/:userId/friends/:friendId'
 * DELETE to remove a friend from a user's friend list
 * @param {import('express').Request< UserParams, {}, {}, {} >} req - request, with parameters userId and friendId
 * @param {import('express').Response} res - response
 */
async function addFriend(req, res) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: req.params.friendId } },
      { runValidators: true, new: true }  
    );

    // Do I need runValidators?  I need something to check if the friend is a real user.

    if (!user) {
      return res.status(404).json({ message: 'No user with that ID' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
}