const { Log } = require('../models');

async function getLogs (req, res, next) {

    const log = new Log({
        url: req.url,
        json: req.body || 'null',
        date: new Date()
    });
    await log.save().then(() => console.log(log));

    next();

}

module.exports = getLogs;





