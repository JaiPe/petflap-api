import express from 'express'

import SurePetAPI from './api.js'

const server = express()

let api = new SurePetAPI()

server.get('/api/flap/status', async (req, res) => {
    try {
        res.status(200).send(String(await api.status()))
    } catch (e) {
        console.error(e)
        res.send(500)
    }
})

server.get('/api/flap/whereis/:pet', async (req, res) => {
    try {
        res.json(await api.locationOf(req.params.pet))
    } catch (e) {
        if (e.message.includes('not find')) {
            return res.status(404).send('Pet not found')
        }
        console.error(e)
        res.send(500)
    }
})

server.get('/api/flap/lock', async (req, res) => {
    try {
        if (await api.lock()) {
            res.status(200).send('Success')
        } else {
            res.status(500).send('Failure')
        }
    } catch (e) {
        console.error(e)
        res.send(500)
    }
})

server.get('/api/flap/unlock', async (req, res) => {
    try {
        if (await api.unlock()) {
            res.status(200).send('Success')
        } else {
            res.status(500).send('Failure')
        }
    } catch (e) {
        console.error(e)
        res.send(500)
    }
})

server.listen(8080)

console.log('Listening on port 8080')
