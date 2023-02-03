import joi from "joi";
const choiceSchema = joi.object({
    title: joi.string().required(),
    pollId: joi.string().required()
})
export default choiceSchema;