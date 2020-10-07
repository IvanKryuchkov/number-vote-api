const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 3001;
const uri = "mongodb+srv://ivan:4ZXDtqYEvjwSQYF@numbers-vote-cluster.gavkw.mongodb.net/votesdb?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const { Vote, Log } = require('./models');
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

app.post('/vote', async (req, res) => {

    const { number } = req.body;

    if(number<1 || number>9) res.send('wrong number');

    try {
    const vote = new Vote({
        number: number,
        date: new Date()
    });
    vote.save().then(() => console.log(vote));

    const message = `Vote for ${number} confirmed`;

    res.send({message: message});

    const log = new Log({
        url: '/vote',
        json: {message: message},
        date: new Date()
    });
    log.save().then(() => console.log(log));
    
    } catch(err) {
        res.json({ message: err })
    }
})

app.get('/statistic', async (req, res) => {
    const { date } = req.query;
    console.log(date);

    if(!/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(date)) res.send('data is not valid');
    const votesByDate = await Vote.find({ date: { "$gte": date, "$lt": new Date(date).getTime()+86400000} });

    const statistic = [];
    votesByDate.forEach(function (vote) {
        const isExistingNumber = (element) => element.number == vote.number;
        if (statistic.findIndex(isExistingNumber)==-1) {
            statistic.push({number: vote.number, count: 1});
        } else {
            statistic[statistic.findIndex(isExistingNumber)].count++;
        }
    });
    const log = new Log({
        url: `/statistic/${date}`,
        json: { statistic },
        date: new Date()
    });
    log.save().then(() => console.log(log));
    console.log(statistic);
    res.send(statistic);
})

app.get('/logs', async (req, res) => {
    const logs = await Log.find({});
    res.send(logs);
})

app.listen(process.env.PORT || 3001, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})