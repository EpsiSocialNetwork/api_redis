require('dotenv').config()

const express = require('express');
const cors = require('cors')
const morgan = require('morgan');
const helmet = require('helmet');

var cors_option = {
  origin: process.env.DOMAIN,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
app.enable('trust proxy');
app.use(helmet());
app.use(morgan('common'));
app.use(express.json());


// --- GET ---
app.get('/:id', async (req, res) => {
  // req.params.id
  res.json({'view':0,'share':0,'like':0, 'react':[]})
})

app.get('/:id/like', async (req, res) => {
  res.json("OK !")
})

// --- POST ---
app.post('/', cors(cors_option), async (req, res) => {
  res.json("OK !")
})

// --- PUT ---
// Add share like view and react
// TODO make more put route
app.put('/:id', async (req, res) => {
  res.json("OK !")
})

// --- DELETE ---
app.delete('/:id', async (req, res) => {
  res.json("OK !")
})



// Look for 
app.use((req, res, next) => res.status(404))

app.use((error, req, res, next) => {
  error.status ? res.status(error.status) : res.status(500)
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  })
})

const port = process.env.PORT || 5225;
app.listen(port, () => console.log(`Listening at http://localhost:${port}`))