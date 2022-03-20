const express = require('express');
const app = express();
const port = 3000;
app.use(express.json({limit: '10kb'}));

app.post('/test', (req, res) => {
    let result = {};
    try {
        let testedFunction = eval(req.body.code);
        result = testedFunction();
    } catch (e) {
        console.log(e);
        res.status(400).json({message: e.message});
        return;
    }
    res.status(200).json(result);
});

app.listen(port, () => {
    console.log(`Runtime app listening on port ${port}`)
});
