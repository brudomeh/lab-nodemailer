const nodemail = require('nodemail');


let transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASSWORD
    }
});

module.exports = {
    transport
}