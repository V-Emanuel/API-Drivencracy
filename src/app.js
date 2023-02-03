import express from "express";
import cors from "cors";
import choiceRoutes from "./routes/choiceRoutes.js"
import pollRoutes from "./routes/pollRoutes.js"


const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

app.use([pollRoutes, choiceRoutes]);

app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`)
});
