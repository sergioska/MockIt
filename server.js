var express = require('express');
var fs = require('fs');

var configurationFile = 'config.json';
var configuration = JSON.parse(
    fs.readFileSync(configurationFile)
);

var global = configuration.global;
var endpoints = configuration.endpoints;


app = express();

endpoints.forEach(function (item) {
	app.all(item.url, function (req, res) {
		// check verb request
		if (req.method != item.verb) {
			fileToJson(global.errors.verb.mock, res);
			return;
		}
		// check parameters request if exists
		if (item.params) {
			var err = false;
			item.params.forEach(function (param) {
				if (!req.query.hasOwnProperty(param)) 
					err = true;
			});
			if (err) {
				fileToJson(global.errors.params.mock, res);
				return;
			}
		}
		// try to do a call
		makeACall(req, res, function(){
			fileToJson(item.mock, res);
		});
		
	});
});

makeACall = function (req, res, callback_ok) {
	if (req.get('Authorization') === undefined) {
		fileToJson(global.errors.access_token.mock, res);
	} else {
		return callback_ok();
	}
}

fileToJson = function (file, res) {
	fs.readFile(file, 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		res.json(JSON.parse(data));
	});
}

app.listen(global.port);
