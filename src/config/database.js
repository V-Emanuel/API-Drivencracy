
import { MongoClient} from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
try {
    await mongoClient.connect()
    db = mongoClient.db()
    console.log('Banco de Dados conectado')
} catch (err) {
    console.log(err)
    console.log('Banco de Dados não conectado')
}

export default db;