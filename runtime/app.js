const express = require('express');
const app = express();
const port = 3000;
app.use(express.json({limit: '10kb'}));

app.post('/test', (req, res) => {
    let testedFunction = eval(req.body.code);
    res.json(testedFunction());
});

app.listen(port, () => {
    console.log(`Runtime app listening on port ${port}`)
});
