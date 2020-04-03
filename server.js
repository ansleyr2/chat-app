/**
 * JASMINE WORKFLOW
 * 
 * ---- To create specs folder ---
 * 
 * ./node_modules/.bin/jasmine init  --> creates specs folder
 * add, test: jasmine to scripts under package.json
 * ------  ------  -----------
 * 
 * npm test --> runs jasmine, tests from server.spec.js under spec folder
 * 
 */

var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.Promise = Promise

var dbUrl = "mongodb+srv://ansrod:ansrod@learning-node-0vpey.mongodb.net/test?retryWrites=true&w=majority"

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

// get messages
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})

// get messages for user
app.get('/messages/:user', (req, res) => {
    var user = req.params.user
    Message.find({name: user}, (err, messages) => {
        res.send(messages)
    })
})

// post messages
app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body)

        var savedMessage = await message.save()

        console.log('saved')

        var censored = await Message.findOne({ message: 'badword' })

        if (censored)
            await Message.remove({ _id: censored.id })
        else
            io.emit('message', req.body)

        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log('message post called')
    }
})


// Socket declare in index.html under script also
io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, { }, (err) => {
    console.log('mongo db connection', err)
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})