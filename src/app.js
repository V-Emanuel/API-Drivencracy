import express from "express";
import cors from "cors";
import choiceRoutes from "./routes/choiceRoutes.js"
import pollRoutes from "./routes/pollRoutes.js"


const PORT = 5000;
const app = express();
app.use(cors());
app.use(express.json());

app.use([pollRoutes, choiceRoutes]);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`)
});
