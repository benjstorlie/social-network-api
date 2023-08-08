const router = require('express').Router();
const { User, Thought } = require('../../models');

// /api/users
router
  .route('/')
  .get(getUsers)
  .post(createUser);

// /api/users/:userId
router
  .route('/:userId')
  .get(getSingleUser)
  .put(updateUser)
  .delete(deleteUser);

// /api/users/:userId/friends/:friendId
router
  .route('/:userId/friends/:friendId')
  .post(addFriend)
  .delete(removeFriend);


module.exports = router;  

// JSDoc Documentation Suggestion [https://stackoverflow.com/a/65108929]
// Install `@types/express` with `npm install --save-dev @types/express`.
// Use custom @typedef to document req.query or req.params

/**
 * @typedef UserParams
 * @prop {String} userId - the user's id number
 * @prop {String} [friendId] - the id number of the user's friend to add or delete
*/

/**
 * example data
 * ```
 * {
 *   "username": "lernantino",
 *   "email": "lernantino@gmail.com"
 * }
 * ```
 * @typedef UserBody
 * @prop {String} username - the new/updated username
 * @prop {String} email - the new/updated email
*/

/**
 * '/api/users'
 * GET all users
 * @async
 * @param {import('express').Request} req - request, no req.body nor req.params
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function getUsers(req,res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/users'
 * POST a new user
 * @async
 * @param {import('express').Request< {}, {}, UserBody, {} >} req - request, with body with user data.
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function createUser(req, res) {
  try {
    const user = await User.create(req.body);

    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    if (err.code === 11000 ) {
      if (err.keyPattern.username) {
        res.status(409).json({message: `username ${err.keyValue.username} already in use`})
      } else if (err.keyPattern.email) {
        res.status(409).json({message: `email ${err.keyValue.email} already in use`})
      } else {
        res.status(500).json(err);
      }
    } else {
      res.status(500).json(err);
    }
  }
}

// email error
// {
//   "errors": {
//     "email": {
//       "name": "ValidatorError",
//       "message": "Path `email` is invalid (greg@greg).",
//       "properties": {
//         "message": "Path `email` is invalid (greg@greg).",
//         "type": "regexp",
//         "regexp": {},
//         "path": "email",
//         "value": "greg@greg"
//       },
//       "kind": "regexp",
//       "path": "email",
//       "value": "greg@greg"
//     }
//   },
//   "_message": "user validation failed",
//   "name": "ValidationError",
//   "message": "user validation failed: email: Path `email` is invalid (greg@greg)."
// }  ** This last message will also include username validation error too.

/**
 * '/api/users/:userId'
 * GET a single user by its _id and populated thought and friend data
 * @async
 * @param {import('express').Request< UserParams, {}, {}, {} >} req - request, with parameter userId
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function getSingleUser(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.userId })
      .select('-__v');   // What does '-__v' mean?

    !user
      ? res.status(404).json({ message: 'No user with that ID' })
      : res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/users/:userId'
 * PUT to update a user by its _id
 * @async
 * @param {import('express').Request< UserParams, {}, UserBody, {} >} req - request, with parameter userId, and body with user data.
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function updateUser(req, res) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { }, // what goes here??
      //{ runValidators: true, new: true }  
    );
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

/**
 * '/api/users/:userId'
 * DELETE to remove user by its _id
 * BONUS: Remove a user's associated thoughts when deleted.
 * @async
 * @param {import('express').Request< UserParams, {}, {}, {} >} req - request, with parameter userId
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function deleteUser(req, res) {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.userId });

    if (!user) {
      res.status(404).json({ message: 'No user with that ID' });
    } else {
      await Thought.deleteMany({ _id: { $in: user.thoughts } });
      res.json({ message: 'User and associated thoughts deleted!' })
    }

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


/**
 * '/api/users/:userId/friends/:friendId'
 * POST to add a new friend to a user's friend list
 * @async
 * @param {import('express').Request< UserParams, {}, {}, {} >} req - request, with parameters userId and friendId
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function addFriend(req, res) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: req.params.friendId } },
      { runValidators: true, new: true }  
    );

    // Do I need runValidators?  I need something to check if the friend is a real user.
      // An error gets thrown if the user id, or the friend id, doesn't exist.  Need to move those custom error messages to the "catch" block.
    // What if they're already friends?

      // friend doesn't exist
      // {
      //   "stringValue": "\"64c1f00dbb777aeee4536\"",
      //   "valueType": "string",
      //   "kind": "ObjectId",
      //   "value": "64c1f00dbb777aeee4536",
      //   "path": "friends",
      //   "reason": {},
      //   "name": "CastError",
      //   "message": "Cast to ObjectId failed for value \"64c1f00dbb777aeee4536\" (type string) at path \"friends\" because of \"BSONError\""
      // }

      // user doesn't exist 

      // {
      //   "stringValue": "\"64c1efcbbb777aeee4669e\"",
      //   "valueType": "string",
      //   "kind": "ObjectId",
      //   "value": "64c1efcbbb777aeee4669e",
      //   "path": "_id",
      //   "reason": {},
      //   "name": "CastError",
      //   "message": "Cast to ObjectId failed for value \"64c1efcbbb777aeee4669e\" (type string) at path \"_id\" for model \"user\""
      // }


    !user
      ? res.status(404).json({ message: 'No user with that ID' })
      : res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}


/**
 * '/api/users/:userId/friends/:friendId'
 * DELETE to remove a friend from a user's friend list
 * @async
 * @param {import('express').Request< UserParams, {}, {}, {} >} req - request, with parameters userId and friendId
 * @param {import('express').Response} res - response
 * @returns {Promise<Void>}
 */
async function removeFriend(req, res) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $addToSet: { friends: req.params.friendId } },
      { runValidators: true, new: true }  
    );

    // Do I need runValidators?  I need to check if the friend was in their friends list in the first place.

    !user
      ? res.status(404).json({ message: 'No user with that ID' })
      : res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}