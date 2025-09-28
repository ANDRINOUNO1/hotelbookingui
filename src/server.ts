import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Role } from './app/_models/role.model.js';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// In-memory accounts (simulate localStorage)
let accounts = [
  {
    id: '1',
    title: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    status: 'Active',
    role: Role.Admin,
    password: 'admin123'
  },
  {
    id: '2',
    title: 'frontdesk',
    firstName: 'Front',
    lastName: 'Desk',
    email: 'frontdesk@example.com',
    status: 'Active',
    role: Role.frontdeskUser,
    password: 'frontdesk123'
  }
];

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Parse JSON bodies
 */
app.use(express.json());

/**
 * Authentication endpoint
 */
app.post('/api/accounts/authenticate', (req, res) => {
  const { email, password, username } = req.body;
  let user = accounts.find(
    x =>
      (x.title && x.title.toLowerCase() === (username || '').toLowerCase() && x.password === password) ||
      (x.email === email && x.password === password)
  );
  if (!user) {
    res.status(400).json({ message: 'Email or password is incorrect' });
    return;
  }
  const jwtToken = 'fake-jwt-token.' + Buffer.from(JSON.stringify({ id: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 })).toString('base64');
  res.json({ ...user, jwtToken });
  return;
});

/**
 * Registration endpoint
 */
app.post('/api/accounts/register', (req, res) => {
  const account = req.body;
  if (accounts.find(x => x.email === account.email)) {
    res.status(400).json({ message: 'Email is already registered' });
    return;
  }
  account.id = (accounts.length + 1).toString();
  account.role = account.role || Role.frontdeskUser;
  account.status = 'Active';
  accounts.push(account);
  res.status(200).json({});
  return;
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
