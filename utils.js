const { Transform } = require('stream');

function RespondWithJson(res, data) {
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data, null, 2));
}

// Обробка помилки читання
function handleError(res, err) {
	res.writeHead(500, { 'Content-Type': 'text/plain' });
	res.end('Error reading CSV file');
}

// Відповідь на не дозволені методи
function methodNotAllowed(res) {
	res.writeHead(405, { 'Content-Type': 'text/plain' });
	res.end('Method Not Allowed');
}

function appendIfExists(obj, list) {
	if (obj) {
		list.push(obj);
	}
}

function csvToJson(line, _, callback) {
	if (!line.trim()) return callback(); // skip empty lines

	if (!this.headers) {
		this.headers = line.split(',');
		return callback(); // header line, don't push
	}

	const values = line.split(',');
	const obj = {};

	this.headers.forEach((key, index) => {
		obj[key] = values[index];
	});

	this.push(obj); // this is crucial
	callback();
}

class CustomStream extends Transform {
  constructor(options) {
    super(options);
  }

  toUpperIfChar(char) {
	return /[a-zа-яёїієґ]/i.test(char) && isNaN(char) ? char.toUpperCase() : char;
  }

  _transform(chunk, _, callback) {
    const input = chunk.toString();
    const transformed = input
      .split('')
      .map(char => this.toUpperIfChar(char))
      .join('');
    
    this.push(transformed);
    callback();
  }
}

module.exports = {
	RespondWithJson,
	handleError,
	methodNotAllowed,
	appendIfExists,
	csvToJson,
	CustomStream,

};
