const express = require('express');
const router = express.Router();
const jobController = require('../controller/jobController');

router.get('/', jobController.getJobs);
router.get('/filters/:companySlug', jobController.getJobFilters);
router.post('/seed', jobController.seedJobs);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
