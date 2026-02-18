const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getStats 
} = require('../controllers/userController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
