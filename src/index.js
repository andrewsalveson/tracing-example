require("@google-cloud/trace-agent").start();
const express = require('express');
const app = express();
const port = 80;
app.use((req, res, next) => {
    console.log('Time: ', Date.now());
    next();
});
app.get('/', (req, res) => {
    res.send('request received');
});
app.get('/test', (req, res) => {
    res.send('testing');
});

app.listen(port, () => console.log(`listening on port ${port}`));
