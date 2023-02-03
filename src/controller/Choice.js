import choiceSchema from "../schema/ChoiceSchema.js";
import db from "../config/database.js"
import dayjs from "dayjs";
import { ObjectId } from "mongodb";

export async function choice(req, res) {
    const choice = req.body;
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
}

export async function choiceVote(req, res) {
    const { id } = req.params;
    const selectedChoice = await db.collection("choice").findOne({ _id: ObjectId(id) });
    if (!selectedChoice) return res.status(404)
    const selectedPoll = await db.collection("poll").findOne({ _id: ObjectId(selectedChoice.pollId) });
    if (!selectedPoll) return res.status(404)
    const today = Date.now();
    const expireDate = new Date(selectedPoll.expireAt);
    if (today > expireDate) return res.sendStatus(403);
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
}