import { Router } from "express"
import validateSchema from "../middleware/validateSchema.js"
import choiceSchema from "../schema/ChoiceSchema.js"
import { choice, choiceVote } from "../controller/Choice.js";

const choiceRouter = Router();

choiceRouter.post("/choice", validateSchema(choiceSchema), choice);
choiceRouter.post("/choice/:id/vote", choiceVote);

export default choiceRouter;
