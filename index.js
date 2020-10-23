require("@google-cloud/trace-agent").start();
const express = require('express');
const https = require('https');
const app = express();
const port = process.env.PORT || 8080;

const justASec = 'https://us-central1-glass-carver-293116.cloudfunctions.net/justASec';
const wobbles = 'https://us-central1-glass-carver-293116.cloudfunctions.net/wobbles';
const fails = 'https://i.dont.exist.sorry';
const wx = 'https://wttr.in'
const other = 'https://tracing-example-2.rj.r.appspot.com/';

function getData(addr) {
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

app.get('/test', async (req, res) => {
    try {
        const results = await Promise.all([
            getData(justASec),
            getData(justASec),
            getData(wx),
        ]);
        const more = await Promise.all([
            getData(justASec),
            getData(justASec),
        ]);
        return res.status(200).send(`with results: ${results}, ${more}`);
    } catch (err) {
        return res.status(400).send(err);
    }
});
app.get('/test-sequence', async (req, res) => {
    let i = 0;
    try {
        while (i < 4) {
            await getData(justASec);
            i++;
        }
        res.status(200).send('success');
    } catch (err) {
        return res.status(500).send(`failed at ${i}`);
    }
});
app.get('/test-sequence-wobbles', async (req, res) => {
    let i = 0;
    try {
        while(i < 12) {
            await getData(wobbles);
            i++;
        }
        return res.status(200).send('success');
    } catch (err) {
        return res.status(500).send(`failed at ${i}`);
    }
    
})
app.get('/test-with-failures', async (req, res) => {
    try {
        const results = await Promise.all([
            getData(justASec),
            getData(fails),
        ]);
        return res.status(200).send(`with results: ${results}`);
    } catch (err) {
        const more = await getData(justASec);
        return res.status(500).send(`with error: ${err}, and more: ${more}`);
    };
});
app.get('/test-sometimes-fails', async (req, res) => {
    try {
        const results = await Promise.all([
            getData(justASec), // should succeed
            getData(wobbles),
            getData(wobbles),
            getData(wobbles),
            getData(wobbles),
        ]);
        return res.status(200).send(`with results ${results}`);
    } catch (err) {
        return res.status(500).send(`with error: ${err}`);
    }
});
app.get('/call-other', async (req, res) => {
    try {
        await getData(`${other}/test-sequence`);
        await getData(justASec);
        await getData(`${other}/test-sequence`);
        return res.status(200).send('results from 2 projects');
    } catch (err) {
        return res.status(500).send(`had error: ${err}`);
    }
});

const server = app.listen(port, () => {
    const instanceHost = server.address().address;
    const instancePort = server.address().port;

    console.log(`Example app listening at http://${instanceHost}:${instancePort}`);
});
