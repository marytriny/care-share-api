// Import packages
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const SqlClient = require('./database/sqlClient')
const sqlClient = new SqlClient();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 9000;
const JWT_SECRET = 'abracadabra';
const JWT_EXPIRES_IN = '1 day';

/******************************************************************************
 * ACCOUNT TABLE QUERIES
 ******************************************************************************/
// UPDATE USER
app.post('/account/update', async (req, res) => {
  try {
    // Update user data in DB
    await sqlClient.updateAccount(req.body);
    res.status(200).send({ message: 'success' });
  } 
  catch (err) {
    console.log('POST update, Something Went Wrong: ', err);
    res.status(400).send({ error: true, message: err.message });
  }
});

// UPDATE PASSWORD
app.post('/account/updatePassword', async (req, res) => {
  try {
    const { email, id, current_password, password } = req.body;

    // Get user data from DB using email
    const user = await sqlClient.getAccount(email);
    if (!user.recordset[0]) {
      res.status(400).json({ msg: 'Invalid Email Or Password' });
      return;
    }

    // Validate current password
    const isMatch = await bcrypt.compare(current_password, user.recordset[0].password_hash);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid Email Or Password' });
      return;
    }

    // Hash the new password and update DB
    const hashedPassword = await bcrypt.hash(password, 8);
    await sqlClient.updateAccountPassword(id, hashedPassword);
    res.status(200).send({ message: 'success' });
  } 
  catch (err) {
    console.log('POST update, Something Went Wrong: ', err);
    res.status(400).send({ error: true, message: err.message });
  }
});

// SIGN UP / ADD USER
app.post('/account/signup', async (req, res) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    const userData = { ...req.body, password: hashedPassword };

    // Store new user data in DB
    await sqlClient.addAccount(userData);

    // Get the JWT token
    const token = jwt.sign({ user: userData }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.send({ user: userData, token });
  } 
  catch (err) {
    console.log('POST account/signup, Something Went Wrong: ', err);
    res.status(400).send({ error: true, message: err.message });
  }
});

// SIGN IN
app.post('/account/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user data from DB using email
    const user = await sqlClient.getAccount(email);
    if (!user.recordset[0]) {
      res.status(400).json({ msg: 'Invalid Email Or Password' });
      return;
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.recordset[0].password_hash);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid Email Or Password' });
      return;
    }

    const token = jwt.sign(
      { id: user.recordset[0].id, email: email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.status(200).json({ token });
  } 
  catch (err) {
    console.log('POST account/signin, Something Went Wrong: ', err);
    res.status(400).send({ error: true, message: err.message });
  }
})

// GET USER FROM TOKEN
app.get('/account/me', async (req, res) => {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const token = String(req?.headers?.authorization?.replace('Bearer ', ''));
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await sqlClient.getAccount(decoded.email);
    if (!user.recordset[0]) {
      res.status(400).json(defaultReturnObject);
      return;
    }

    delete user.recordset[0].password_hash;
    res.status(200).json({ authenticated: true, user: user.recordset[0] });
  }
  catch (err) {
    console.log('POST account/me, Something Went Wrong', err);
    res.status(400).json(defaultReturnObject);
  }
})

app.post('/account/org', async (req, res) =>
  sqlClient.getOrganizationDetails(req.body.organization)
    .then(response => res.status(200).send(response.recordset[0]))
    .catch(error => res.status(500).send(error))
)

/******************************************************************************
 * DONATIONS TABLE QUERIES
 ******************************************************************************/
app.post('/donation', async (req, res) =>
  sqlClient.addDonation(req.body)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
);

app.put('/donation', (req, res) =>
  sqlClient.updateDonation(req)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error.message))
);

app.put('/donation/status', (req, res) =>
  sqlClient.updateDonationStatus(req.body)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error.message))
);

app.get('/donation', (req, res) =>
  sqlClient.getPendingDonations()
    .then(response => res.status(200).send(response.recordset))
    .catch(error => res.status(500).send(error.message))
);

app.post('/donation/accepted', (req, res) => 
  sqlClient.getAcceptedDonations(req.body.distributor)
    .then(response => res.status(200).send(response.recordset))
    .catch(error => res.status(500).send(error.message))
);

app.post('/donation/donor', (req, res) =>
  sqlClient.getDonorDonations(req.body.donor)
    .then(response => res.status(200).send(response.recordset))
    .catch(error => res.status(500).send(error.message))
);

app.put('/donation/expired', (req, res) =>
  sqlClient.updateExpiredDonations()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error.message))
);

app.listen(PORT, () => console.log('API is running on port ', PORT));
