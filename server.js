const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { parse } = require('querystring');

const filePaths = {
  '/': path.join(__dirname, './compenents/portfolio.html'),
  '/contact.html': path.join(__dirname, './compenents/contact.html'),
  '/Creations.html': path.join(__dirname, './compenents/Creations.html'),
  '/C.V.html': path.join(__dirname, './compenents/C.V.html'),
  '/Creation-2.html': path.join(__dirname, './compenents/Creation-2.html'),
  '/Untitled-2.html': path.join(__dirname, './compenents/Untitled-2.html'),
  '/preuve-w3c.html': path.join(__dirname, './compenents/preuve-w3c.html'),
};

const assetsDir = path.join(__dirname, './assets');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function chooseProtocol() {
  rl.question('Souhaitez-vous démarrer le serveur en HTTPS ? (Y/N): ', (protocol) => {
    if (protocol.toLowerCase() === 'y') {
      const options = {
        key: fs.readFileSync('../cert/private.key'),
        cert: fs.readFileSync('../cert/certificate.crt'),
      };
      startHTTPS(options);
    } else {
      startHTTP();
    }
  });
}

function startHTTP() {
  const server = http.createServer((req, res) => {
    handleRequest(req, res);
  });
  server.listen(8080, '0.0.0.0', async () => {
    console.log('Serveur HTTP démarré sur le port 8080');
    const { default: open } = await import('open');
    open('http://localhost:8080');
  });
}

function startHTTPS(options) {
  const server = https.createServer(options, (req, res) => {
    handleRequest(req, res);
  });
  server.listen(8443, '0.0.0.0', async () => {
    console.log('Serveur HTTPS démarré sur le port 8443');
    const { default: open } = await import('open');
    open('https://localhost:8443');
  });
}

function handleRequest(req, res) {
  console.log(`Requête reçue pour l'URL : ${req.url}`);

  if (req.url.startsWith('/assets/')) {
    const assetPath = path.join(assetsDir, req.url.replace('/assets', ''));
    fs.readFile(assetPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Asset non trouvé');
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
    return;
  }
  
  if (req.method === 'GET') {
    if (filePaths[req.url]) {
      fs.readFile(filePaths[req.url], (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Erreur interne du serveur');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else if (req.url === '/chartes') {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Page Chartes non trouvée</h1>');
    } else {
      fs.readFile(path.join(__dirname, './compenents/Untitled-2.html'), (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Erreur interne du serveur');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    }
  } else if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const parsedBody = parse(body);
      const username = parsedBody.username;
      const password = parsedBody.password;
      if (username === 'user' && password === 'pass') {
        fs.readFile(filePaths['/Creations.html'], (err, data) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Erreur interne du serveur');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end('Identifiant ou mot de passe incorrect');
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Méthode non autorisée');
  }
}
chooseProtocol();