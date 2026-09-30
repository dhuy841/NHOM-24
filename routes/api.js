const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const memberController = require('../controllers/memberController');
const aiController = require('../controllers/aiController');

// Auth
router.post('/login', authController.login);

// Members
router.get('/members', authController.authenticateToken, memberController.getMembers);
router.post('/members', authController.authenticateToken, memberController.addMember);
router.put('/members/:id', authController.authenticateToken, memberController.updateMember);
router.delete('/members/:id', authController.authenticateToken, memberController.deleteMember);

// AI
router.post('/ai/plan-event', authController.authenticateToken, aiController.planEvent);
router.post('/ai/chat', authController.authenticateToken, aiController.chat);

module.exports = router;