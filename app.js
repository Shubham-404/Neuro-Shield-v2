const path = require('path')
const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express();

app.use(express.json()); // to work with json responses and requests.
app.use(express.urlencoded({ extended: true })); // to encode the data from body in post request
app.use(express.static(path.join(__dirname, 'public'))); // to serve static files from public dir
app.use(cookieParser()); // to work with cookeis

const corsOptions = {
    origin: ['http://localhost:5173', 'https://cipher-bucks.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
};
app.use(cors(corsOptions))

const { connectToDB } = require("./config/connect-to-db");
connectToDB(); 

const userRouter = require('./routes/user-router')
const testRouter = require('./routes/test-router');
const hisabRouter = require('./routes/hisab-router');
const aiRouter = require('./routes/ai-router');

app.use('/test1', testRouter)
app.use('/api/user', userRouter) // verify User here....
app.use('/hisab', hisabRouter) // Hisaab related here....
app.use('/ai', aiRouter) // AI related router


// all other routes
app.get(/^.*/, (req, res) => {
    res.status(404).send("404 Page Not Found!")
})
app.post(/^.*/, (req, res) => {
    res.status(404).send("404 Page Not Found!")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server live at http://localhost:${PORT}/`)
})