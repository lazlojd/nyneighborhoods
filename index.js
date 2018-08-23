const express = require('express');
const app = express();

// const cors = require('cors');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

//app.use(express.static('public'))

// app.use(cors());
// app.options('*', cors())


app.use(express.static(__dirname + '/public'));
const port = process.env.port || 8080

var server = app.listen(port, () => {
	console.log('Now listening to port ' + port);
})

const routes = require('./routes');
app.use('/api', routes)
