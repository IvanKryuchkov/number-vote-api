const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 3001;
const mongoose = require('mongoose');
const { Vote, Log } = require('./models');
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@numbers-vote-cluster.gavkw.mongodb.net/votesdb?retryWrites=true&w=majority`;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const getLogs = require('./middleware/getLogs');

app.post('/vote', getLogs, async (req, res) => {

    const { number } = req.body;

    if(number<1 || number>9) res.send('wrong number');

    try {
    const vote = new Vote({
        number: number,
        date: new Date()
    });
    await vote.save().then(() => console.log(vote));

    const message = `Vote for ${number} confirmed`;

    res.send({message: message});
    
    } catch(err) {
        res.json({ message: err })
    }
})

app.get('/statistic', getLogs, async (req, res) => {
    const { date } = req.query;

    if(!/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(date)) res.send('data is not valid');

    const votes = await Vote
    .aggregate( [
        { $match: { date: { "$gte": new Date(date), "$lt": new Date(new Date(date).getTime()+86400000) } } },
        { $group: { _id: "$number".toString() , count: { $sum: 1 } } }
    ])
    res.send(votes);
})

app.get('/logs', getLogs, async (req, res) => {
    const logs = await Log.find({});
    res.send(logs);
})

app.listen(process.env.PORT || 3001, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})