import express from 'express';

import SurePetAPI from './sources/surepet/index.js';
import YaleAPI from './sources/yale/index.js';

const server = express();

let surePet = new SurePetAPI();
let yale = new YaleAPI();

server.get('/api/yale/status', async (req, res) => {
    try {
        res.status(200).send(String(await yale.isArmed()));
    } catch (e) {
        console.error(e);
        res.send(500);
    }
});

server.get('/api/yale/partarm', async (req, res) => {
    try {
        if (await yale.partArm()) {
            res.status(200).send('Successfully part-armed');
        } else {
            res.status(500).send('Failure');
        }
    } catch (e) {
        console.error(e);
        res.send(500);
    }
});

server.get('/api/yale/disarm', async (req, res) => {
    try {
        if (await yale.disarm()) {
            res.status(200).send('Successfully disarmed');
        } else {
            res.status(500).send('Failure');
        }
    } catch (e) {
        console.error(e);
        res.send(500);
    }
});

server.get('/api/surepet/status', async (req, res) => {
    try {
        res.status(200).send(String(await surePet.status()));
    } catch (e) {
        console.error(e);
        res.send(500);
    }
});

server.get('/api/surepet/whereis/:pet', async (req, res) => {
    try {
        res.json(await surePet.locationOf(req.params.pet));
    } catch (e) {
        if (e.message.includes('not find')) {
            return res.status(404).send('Pet not found');
        }
        console.error(e);
        res.send(500);
    }
});

server.get('/api/surepet/lock', async (req, res) => {
    try {
        if (await surePet.lock()) {
            res.status(200).send('Successfully locked');
        } else {
            res.status(500).send('Failure');
        }
    } catch (e) {
        console.error(e);
        res.send(500);
    }
});

server.get('/api/surepet/unlock', async (req, res) => {
    try {
        if (await surePet.unlock()) {
            res.status(200).send('Successfully unlocked');
        } else {
            res.status(500).send('Failure');
        }
    } catch (e) {
        console.error(e);
        res.send(500);
    }
});

const PORT = process.env.PORT || 8080;

server.listen(PORT);
console.log(`Listening on port ${PORT}`);
