var mongoose = require('mongoose');
var Song = require('./song');

exports.getAllSongs = function(callback){
	var query = Song.find();
	query.exec(function(err,song){
		callback(song);
	});
}