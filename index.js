const tracing = require("@google-cloud/trace-agent");
tracing.start();
const express = require('express');
const https = require('https');
const app = express();
const port = process.env.PORT || 8080;

const getData = (addr) => {
    console.log(`getting data from ${addr}`)
    return new Promise((resolve, reject)=>{
        https.get(addr, (res) => {
            res.on('data', (data) => {
                resolve(data.toString());
            });
        }).on('error', (e)=>{
            reject(e);
        });;
    });
}

app.get('/test', (req, res) => {
    Promise.all([
        getData('https://artgot.com/sip.php'),
        getData('https://wttr.in'),
    ]).then(async (results) => {
        const more = await getData('https://example.com');
        return res.status(200).send(`with results: ${results}, ${more}`);
    }).catch((err) => {
        return res.status(400).send(err);
    });
});
app.get('/test-with-failures', (req, res) => {
    Promise.all([
        getData('https://wttr.in'),
        getData('https://i.dont.exist.sorry'),
    ]).then((results) => {
        return res.status(200).send(`with results: ${results}`);
    }).catch ((err) => {
        return res.status(400).send(`with error: ${err}`);
    });
});

const server = app.listen(port, () => {
    const instanceHost = server.address().address;
    const instancePort = server.address().port;

    console.log(`Example app listening at http://${instanceHost}:${instancePort}`);
});
  