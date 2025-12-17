const express = require('express');
const router = express.Router();
const { connectUserToApartment } = require('../controllers/apartmentController');

router.post('/:apartmentId', connectUserToApartment);

module.exports = router;