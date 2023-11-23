import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import router from './routes/index.js';
import dbConnection from './dbConfig/index.js';


dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;


dbConnection();

app.use(helmet());
app.use(cors());
app.set("view engine", "ejs");
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


app.use(morgan("dev"));
app.use(router);




app.listen(PORT, () => {
  console.log(`server is running on port : ${PORT}`);
});
