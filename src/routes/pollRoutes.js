import { Router } from "express"
import validateSchema from "../middleware/validateSchema.js"
import pollSchema from "../schema/PollSchema.js"
import { postPoll, getPoll, pollChoice, result } from "../controller/Poll.js"

const pollRoutes = Router();

pollRoutes.post("/poll", validateSchema(pollSchema), postPoll);
pollRoutes.get("/poll", getPoll);
pollRoutes.get("/poll/:id/choice", pollChoice);
pollRoutes.get("/poll/:id/result", result);

export default pollRoutes;