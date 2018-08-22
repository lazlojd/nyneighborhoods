const express = require('express');
const app = express();

// const cors = require('cors');

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())

app.use(express.static('public'))

// app.use(cors());
// app.options('*', cors())



const port = process.env.port || 9000

var server = app.listen(port, () => {
	console.log('Now listening to port ' + port);
})
//app.use(express.static(__dirname + '/public'));
const routes = require('./routes');
app.use('/api', routes)
