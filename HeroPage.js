// const express = require('express');
// const path = require('path')
// const app = express();

// // setup static and middlweware
// app.use(express.static('./dist'))

// app.get('/', (req, res) => {
//   res.sendFile(path.resolve(__dirname,'./dist/index.html'))
// })

// app.all('*', (req, res) => {
//   res.status(404).send('resource not found')
// })

// app.listen(5000, () => {
//   console.log('server is listening on port 5000...')
// })

const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');

const start = Date.now(),
  protocol = process.env.PROTOCOL || 'https',
  port = process.env.PORT || '5000',
  host = process.env.HOST || 'localhost';

let server;

function sendBootStatus(status) {
  // don't send anything if we're not running in a fork
  if (!process.send) {
    return;
  }
  process.send({ boot: status });
}

const app = express();
// -------------------------------------------------------------------
app.use(express.static('./dist'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './dist/index.html'));
});

app.all('*', (req, res) => {
  res.status(404).send('resource not found');
});



// -------------------------------------------------

app.get('/version', function (req, res) {
  res.json({
    version: pkg.version,
  });
});

console.log(
  chalk.yellow('%s booted in %dms - %s://%s:%s'),
  pkg.name,
  Date.now() - start,
  protocol,
  host,
  port
);

// Start a development HTTPS server.
if (protocol === 'https') {
  const { execSync } = require('child_process');
  const execOptions = { encoding: 'utf-8', windowsHide: true };
  let key = './certs/key.pem';
  let certificate = './certs/certificate.pem';

  if (!fs.existsSync(key) || !fs.existsSync(certificate)) {
    try {
      execSync('openssl version', execOptions);
      execSync(
        `openssl req -x509 -newkey rsa:2048 -keyout ./certs/key.tmp.pem -out ${certificate} -days 365 -nodes -subj "/C=US/ST=Foo/L=Bar/O=Baz/CN=localhost"`,
        execOptions
      );
      execSync(`openssl rsa -in ./certs/key.tmp.pem -out ${key}`, execOptions);
      execSync('rm ./certs/key.tmp.pem', execOptions);
    } catch (error) {
      console.error(error);
    }
  }

  const options = {
    key: fs.readFileSync(key),
    cert: fs.readFileSync(certificate),
    passphrase: 'password'
  };

  server = require('https').createServer(options, app);

} else {
  server = require('http').createServer(app);
}

server.listen({ port, host }, function () {
  // Tell the parent process that Server has booted.
  sendBootStatus('ready');
});
