const express = require('express');
const app = express();
const port = 3000;
app.use(express.json({limit: '10kb'}));

app.get('/test', (req, res) => {
    let response = eval(`res.body.code`);
    res.json(response);
});

app.listen(port, () => {
    console.log(`Runtime app listening on port ${port}`)
});
