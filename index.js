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

app.post('/signup', (req, res) => {
  sqlClient.addAccount(req)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

// SIGN UP
app.post('/auth/signup', async (req, res) => {
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
    console.log('POST auth/signup, Something Went Wrong: ', err);
    res.status(400).send({ error: true, message: err.message });
  }
});

// SIGN IN
app.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user data from DB using email
    const user = await sqlClient.getAccount(email);
    console.log(user.recordset[0]);
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
    console.log('POST auth/signin, Something Went Wrong: ', err);
    res.status(400).send({ error: true, message: err.message });
  }
})

// GET USER FROM TOKEN
app.get('/auth/me', async (req, res) => {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const token = String(req?.headers?.authorization?.replace('Bearer ', ''));
    const decoded = jwt.verify(token, JWT_SECRET);
    const getUserResponse = await gqlClient.request(GetUserByEmailQuery, { email: decoded.email });
    const { nextUser } = getUserResponse;
    if (!nextUser) {
      res.status(400).json(defaultReturnObject);
      return;
    }
    delete nextUser.password
    res.status(200).json({ authenticated: true, user: nextUser });
  }
  catch (err) {
    console.log('POST auth/me, Something Went Wrong', err);
    res.status(400).json(defaultReturnObject);
  }
})

app.listen(PORT, () => console.log('API is running on port ', PORT));