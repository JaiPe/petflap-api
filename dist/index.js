var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import SurePetAPI from './sources/surepet/index.js';
import YaleAPI from './sources/yale/index.js';
const server = express();
let surePet = new SurePetAPI();
let yale = new YaleAPI();
server.get('/api/yale/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send(String(yield yale.isArmed()));
    }
    catch (e) {
        console.error(e);
        res.send(500);
    }
}));
server.get('/api/yale/partarm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send(String(yield yale.partArm()));
    }
    catch (e) {
        console.error(e);
        res.send(500);
    }
}));
server.get('/api/yale/disarm', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send(String(yield yale.disarm()));
    }
    catch (e) {
        console.error(e);
        res.send(500);
    }
}));
server.get('/api/surepet/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send(String(yield surePet.status()));
    }
    catch (e) {
        console.error(e);
        res.send(500);
    }
}));
server.get('/api/surepet/whereis/:pet', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(yield surePet.locationOf(req.params.pet));
    }
    catch (e) {
        if (e.message.includes('not find')) {
            return res.status(404).send('Pet not found');
        }
        console.error(e);
        res.send(500);
    }
}));
server.get('/api/surepet/lock', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (yield surePet.lock()) {
            res.status(200).send('Success');
        }
        else {
            res.status(500).send('Failure');
        }
    }
    catch (e) {
        console.error(e);
        res.send(500);
    }
}));
server.get('/api/surepet/unlock', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (yield surePet.unlock()) {
            res.status(200).send('Success');
        }
        else {
            res.status(500).send('Failure');
        }
    }
    catch (e) {
        console.error(e);
        res.send(500);
    }
}));
server.listen(8080);
console.log('Listening on port 8080');
