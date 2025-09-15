const express = require('express');
const { registerUser, loginUser, getProfile, updateProfile, uploadAvatar, updatePrivacySettings, exportUserData, deleteAccount } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/avatar', auth, uploadAvatar);
router.put('/privacy', auth, updatePrivacySettings);
router.get('/export', auth, exportUserData);
router.delete('/account', auth, deleteAccount);

module.exports = router;