const express = require('express');
const router = express.Router();

const mongodb = require('mongodb')


let users;

let uri = 'mongodb://dbuser1:123DBuser456@ds125602.mlab.com:25602/neighborhoodhighlights';
mongodb.MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
	if (err) throw err;

	let db = client.db('neighborhoodhighlights')
	users = db.collection('users');
	users.deleteMany({})

})


// get entire database
router.get('/test', function(req, res) {
	users.find().toArray(function(err, docs) {
		res.send(docs)
	})
})


// Get all highlight from particular neighborhood for particular user
router.get('/:user/:neighborhood/allHighlights', function(req, res) {
	let user = req.params["user"]
	let neighborhood = req.params["neighborhood"]
	users.findOne({userID: {$eq: user}}, function(err, result) {
		if (result != null)
			res.send(result.highlights[neighborhood])
		else
			res.send([])
	})
})


// get all highlights for particular user
router.get('/:user/allHighlights', function(req, res) {
	let user = req.params["user"]
	users.findOne({userID: {$eq: user}}, function(err, result) {
		res.send(result);
	})
})

// Delete particular highlight in particular neighborhood
// body will inculde neighborhood to delete (ex: {delete: "bridgeport"}) 
router.post('/:user/:index/delete', function(req, res) {
	let user = req.params["user"]
	let index = req.params["index"]
	users.findOne({userID: {$eq: user}}, function(err, result) {
		result.highlights[req.body.delete].splice(index, 1)
		console.log(result.highlights[req.body.delete])
		let highlights = result.highlights;
		users.updateOne(
				{userID: {$eq: user}}, 
				{$set: {highlights: highlights} }
				);
		res.send("highlight deleted")
	})

})

// Edit particular highlight in particular neighborhood
router.post('/:user/:index/edit', function(req, res) {
	let user = req.params["user"]
	let index = req.params["index"]
	users.findOne({userID: {$eq: user}}, function(err, result) {
		result.highlights[req.body.neighborhood][index] = req.body.text
		
		var highlights = result.highlights
		console.log(highlights)
		users.updateOne(
				{userID: {$eq: user}}, 
				{$set: {highlights: highlights} }
				);
		res.send("highlight edited")
	})
	
})

// Add a new highlight
router.post('/:user/newHighlight', function(req, res) {
	let user = req.params["user"]
	let userExists = users.findOne({userID: {$eq: user}}, function(err, result) {

		if (err) throw err;
		if (result !== null) {
			if (typeof(result.highlights[req.body.neighborhood]) === 'undefined')
				result.highlights[req.body.neighborhood] = []
			result.highlights[req.body.neighborhood].push(req.body.text);
			var neighb = req.body.neighborhood
			let highlights = result.highlights
			console.log(highlights)
			users.updateOne(
				{userID: {$eq: user}}, 
				{$set: {highlights: highlights} }
				);
			res.send("highlight added")
		} else {
			let newUser = {
				userID: user,
				highlights: {}
			}
			newUser.highlights[req.body.neighborhood] = [req.body.text]
			users.insertOne(newUser)
			res.send("new User added")
		}
		
	})

	// users.update({userID: {$eq: user}}, {})
})

module.exports = router