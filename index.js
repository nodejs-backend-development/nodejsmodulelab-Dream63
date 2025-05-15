const http = require('http');
const url = require('url');
const fs = require('fs');
const split2 = require('split2');
const through2 = require('through2');
const path = require('path');
const utils = require('./utils');

const csvFilePath = path.join(__dirname, 'data.csv');
const host = 'localhost';
const port = 8000;

const taskTest = 3;

switch(taskTest) {
	case 1: case 2:
		startServer();
		break;
	case 3:
		customStream();
		break;

	default:
		return;
}

// Servers

function startServer() {
	const server = http.createServer(requestHandler);

	server.listen(port, host, () => {
		console.log(`Server is running on http://${host}:${port}`);
	});
}

// server req handler

function requestHandler(req, res) {
	switch (taskTest) {
		case 1:
			checkForNameParameter(req, res);
			break;

		case 2:
			checkForGETMethod(req, res);
			break;
		default: 
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.end('Something went wrong');
			return;
	}
	
}

// 1 - Params
function checkForNameParameter(req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain' });

	const parsedUrl = url.parse(req.url, true);
	const query = parsedUrl.query;

	if (query.name) {
		res.end(
			`Hello ${query.name}. You are ${query.age} years old and live in ${query.city}.`
		);
	} else {
		res.end('You should provide name parameter (/?name=dima&age=19&city=chernivtci)');
	}
}

// 2 - GET req
function handleCSVResponse(res) {
	console.log("handleCSVResponse");
	const result = [];
	const readStream = fs.createReadStream(csvFilePath);

	readStream
		.pipe(split2())
		.pipe(through2.obj(utils.csvToJson))

		.on('data', (obj) => utils.appendIfExists(obj, result))
		.on('finish', () => utils.RespondWithJson(res, result))
		.on('error', (err) => utils.handleError(res, err));
}

function checkForGETMethod(req, res) {
	const parsedUrl = url.parse(req.url, true);
	if (req.method === 'GET' && parsedUrl.pathname === '/data') {
		handleCSVResponse(res);
	} else {
		utils.methodNotAllowed(res);
	}
}

// 3 Console log

function customStream() {
	const customStream = new utils.CustomStream();
	process.stdin.pipe(customStream).pipe(process.stdout);
}
