import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from 'uuid';
import dayjs from "dayjs";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
const PORT = 5000;

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
try {
    await mongoClient.connect()
    db = mongoClient.db()
    console.log('Deu certo')
} catch (err) {
    console.log(err)
    console.log('Deu errado')
}

app.post('/poll', async (req, res) => {
    const poll = req.body;
    const pollSchema = joi.object({
        title: joi.string().required()
    })
    const validation = pollSchema.validate({ title: poll.title }, { abortEarly: true })
    if (validation.error) {
        return res.status(422);
    }
    if (!poll.expireAt) {
        let date = dayjs();
        let newDate = date.add('30', 'day')
        poll.expireAt = newDate.format('YYYY-MM-DD HH:mm')
    }
    try {
        await db.collection('poll').insertOne({
            title: poll.title,
            expireAt: poll.expireAt
        })
        res.send(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.get('/poll', async (req, res) => {
    const polls = await db.collection("poll").find().toArray()
    try {
        if (!polls) return res.status(404).send("Não há enquetes")
        res.send(polls)
    } catch {
        res.status(500).send("Erro no servidor")
    }
})

app.post('/choice', async (req, res) => {
    const choice = req.body;
    const choiceSchema = joi.object({
        title: joi.string().required(),
        pollId: joi.string().required()
    })

    const validation = choiceSchema.validate(choice, { abortEarly: true })
    if (validation.error) {
        return res.sendStatus(422)
    }

    const pollExists = await db.collection('poll').findOne({ _id: ObjectId(choice.pollId) })
    if (!pollExists) return res.sendStatus(422)

    const today = Date.now();
    const expireDate = new Date(pollExists.expireAt);
    if (today > expireDate) return res.sendStatus(403)

    const titleExists = await db.collection('choice').findOne({ title: choice.title })
    if (titleExists) return res.sendStatus(409)

    try {
        await db.collection('choice').insertOne({
            title: choice.title,
            pollId: choice.pollId
        })
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.get('/poll/:id/choice', async (req, res) => {

    const { id } = req.params;
    const choice = await db.collection("choice").find({ pollId: id }).toArray()
    try {
        if (!choice) return res.status(404)
        res.send(choice)
    } catch {
        res.status(500).send("Erro no servidor")
    }
})

app.post('/choice/:id/vote', async (req, res) => {
    const { id } = req.params;
    const selectedChoice = await db.collection("choice").findOne({ _id: ObjectId(id) });
    if (!selectedChoice) return res.status(404)
    const selectedPoll = await db.collection("poll").findOne({ _id: ObjectId(selectedChoice.pollId) });
    if (!selectedPoll) return res.status(404)
    const today = Date.now();
    const expireDate = new Date(selectedPoll.expireAt);
    if (today > Date.now()) return res.sendStatus(403);
    try {
        await db.collection('votes').insertOne({
            pollId: selectedChoice.pollId,
            title: selectedChoice.title,
            date: dayjs().format('YYYY-MM-DD HH:mm')
        })
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send("Erro no servidor")
    }
})

app.get('/poll/:id/result', async (req, res) => {

    const { id } = req.params;
    const poll = await db.collection("poll").findOne({ _id: ObjectId(id) })
    if(!poll) return res.status(404)
    const allVotes = await db.collection("votes").find({ pollId: id }).toArray()

    let frequency = {};
    let maxEl = allVotes[0], maxCount = 1;
    for (let i = 0; i < allVotes.length; i++) {
        let el = JSON.stringify(allVotes[i]);
        if (frequency[el] == null) {
            frequency[el] = 1;
        } else {
            frequency[el]++;
        }
        if (frequency[el] > maxCount) {
            maxEl = allVotes[i];
            maxCount = frequency[el];
        }
    }

    const result = [{results: maxEl, maxCount}] ;

    try{
        //res.send([...poll, ...result])
        res.send(result)
    }catch(err){
        res.status(500).send("Erro no servidor")
    }

})

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`)
});