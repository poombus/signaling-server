var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
    let url = req.get('host')+req.originalUrl;
    let params = new URL(url).searchParams;
    console.log(`offer req ${params.get('param1')}`);
});

module.exports = router;