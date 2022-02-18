// REQUIRES
const express = require('express');

// VARIABLES
const router = express.Router();

// GETS
// index
router.get('/', (req, res) => {
  res.render('index.html', {title: ''}); // render de index page
});


module.exports = router;