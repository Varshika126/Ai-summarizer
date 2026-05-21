const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createSummary,
  getSummaries,
  getSummaryById,
  toggleFavoriteSummary,
  editSummaryTitle,
  deleteSummary,
  clearSummaryHistory,
  getSummaryAnalytics
} = require('../controllers/summaryController');
const { protect } = require('../middleware/authMiddleware');

// Setup multer memory storage for file uploads (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.route('/')
  .post(protect, upload.single('file'), createSummary)
  .get(protect, getSummaries)
  .delete(protect, clearSummaryHistory);

router.get('/analytics', protect, getSummaryAnalytics);

router.route('/:id')
  .get(protect, getSummaryById)
  .delete(protect, deleteSummary);

router.put('/:id/favorite', protect, toggleFavoriteSummary);
router.put('/:id/title', protect, editSummaryTitle);

module.exports = router;
