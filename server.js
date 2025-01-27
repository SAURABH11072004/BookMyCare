const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 5001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'nil@123456789',
  database: 'maindatabase'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Handle login POST request
const session = require('express-session');

app.use(session({
  secret: 'nil@123', // Replace with a strong secret
  resave: false,
  saveUninitialized: true,
}));

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length > 0) {
      const isValidPassword = await bcrypt.compare(password, results[0].password);
      if (isValidPassword) {
        req.session.userId = results[0].id;
        res.status(200).json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  });
});




// Serve main.html after login
app.get('/home3.html', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('home3', { id: req.session.userId });
});



// Serve signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Handle signup POST request
const bcrypt = require('bcrypt');

app.post('/signup', async (req, res) => {
  const { first_name, last_name, email, gender, phone_number, dob, location, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  const query = `INSERT INTO users (first_name, last_name, email, gender, phone_number, dob, location, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [first_name, last_name, email, gender, phone_number, dob, location, hashedPassword], (err, results) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Email already exists.' });
      }
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    res.status(200).json({ success: true, message: 'User registered successfully' });
  });
});


// Serve the profile page (after login)
app.get('/profile', (req, res) => {
  const userId = req.query.userId; // Assuming the user's ID is passed as a query parameter
  const query = `SELECT first_name, last_name, email, gender, phone_number, dob, location FROM users WHERE id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length > 0) {
      // Render the profile page with user data
      res.render('profile', { user: results[0] });
    } else {
      // If no user is found
      res.status(404).send('User not found');
    }
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});