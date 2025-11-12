const express = require('express');
const router = express.Router();
const companyController = require('../controller/companyController');

router.post('/auth/login', companyController.loginRecruiter);
router.get('/:slug', companyController.getCompany);
router.put('/:slug', companyController.updateCompany);
router.post('/:slug/publish', companyController.publishCompany);

module.exports = router;
