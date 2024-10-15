import express from 'express'
import 'dotenv/config' // Loads environment variables from .env file
import roomRouter from './routes/rooms.mts'
import cors from 'cors'
import morgan from 'morgan'

import { initializeApp, applicationDefault } from 'firebase-admin/app'

initializeApp({
    credential: applicationDefault(),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

const app = express()
const { PORT } = process.env

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use("/rooms", roomRouter)

app.listen(PORT, () => {
    console.log("Server listening on port", PORT)
})