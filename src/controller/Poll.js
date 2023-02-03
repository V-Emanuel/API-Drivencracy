import db from "../config/database.js";
import pollSchema from "../schema/PollSchema.js";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";

export async function postPoll(req, res) {
    const poll = req.body;
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
}
export async function getPoll(req, res) {
    const polls = await db.collection("poll").find().toArray()
    try {
        if (!polls) return res.status(404)
        res.send(polls)
    } catch {
        res.status(500).send("Erro no servidor")
    }
}
export async function pollChoice(req, res) {
    const { id } = req.params;
    const choice = await db.collection("choice").find({ pollId: id }).toArray()
    if (!choice) return res.status(404)
    try {
        res.send(choice)
    } catch {
        res.status(500).send("Erro no servidor")
    }
}
export async function result(req, res) {
    const { id } = req.params;
    const poll = await db.collection("poll").findOne({ _id: ObjectId(id) })
    if (!poll) return res.sendStatus(404)
    const allVotes = await db.collection("votes").find({ pollId: id }).toArray()

    for (let i = 0; i < allVotes.length; i++) {
        delete allVotes[i]._id
        delete allVotes[i].pollId
        delete allVotes[i].date
    }

    let frequency = {};
    let maxCount = 0;
    let mostFrequent;

    for (let i = 0; i < allVotes.length; i++) {
        let obj = JSON.stringify(allVotes[i]);
        if (frequency[obj] === undefined) {
            frequency[obj] = 1;
        } else {
            frequency[obj]++;
        }

        if (frequency[obj] > maxCount) {
            maxCount = frequency[obj];
            mostFrequent = allVotes[i];
        }
    }

    mostFrequent.votes = maxCount
    const result = mostFrequent

    try {
        res.send({ ...poll, result })
    } catch (err) {
        res.status(500).send("Erro no servidor")
    }

}