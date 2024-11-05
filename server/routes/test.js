const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

router.post('/test', (req, res) => {
    const data = req.body;
    res.json({ 
        message: 'Data received successfully!',
        data: data 
    });
});

module.exports = router;