import * as express from 'express';
import * as dotenv from "dotenv";
import initializeModules from './modules/initializeModules';
import { connectDB } from './config/mongoConfig';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initializeModules(app);


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});


connectDB();