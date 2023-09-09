const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const JWT_SECRET = '1abc3222748541707846970b016a2d45f13507597ded2b54d87a72961c5cf18f';

const dbPath = path.join(__dirname, 'employees-server', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath));


app.use(express.json()); // Parse JSON request bodies

// Serve your HTML, CSS, and JavaScript files from the root folder
app.use(express.static(__dirname)); // Serve files from the root folder


passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        (email, password, done) => {
            // Find the user by email
            const user = db.users.find((user) => user.email === email);

            // If the user is not found or the password is incorrect, return an error
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return done(null, false, { message: 'Incorrect email or password' });
            }

            // Authentication successful, return the user
            return done(null, user);
        }
    )
);

// Passport JWT Strategy for protected routes
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET,
        },
        (jwtPayload, done) => {
            // Find the user by ID
            const user = db.users.find((user) => user.id === jwtPayload.sub);

            // If the user is found, return the user
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        }
    )
);

app.use(passport.initialize());

// Handle user registration

app.post('/register', async (req, res) => {
    const newUser = req.body;

    // Generate a salt and hash the user's password
    try {
        const saltRounds = 10; // Adjust the number of rounds as needed for your application
        const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);

        // Create a new user object with the hashed password
        const userWithHashedPassword = {
            ...newUser,
            password: hashedPassword,
        };

        // Define the path to the db.json file
        const dbPath = path.join(__dirname, 'employees-server', 'db.json');

        // Load the existing database
        const db = JSON.parse(fs.readFileSync(dbPath));

        // Check if the email already exists in the database
        const existingUser = db.users.find(user => user.email === newUser.email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Add the new user to the database
        db.users.push(userWithHashedPassword);

        // Update the db.json file with the new user data
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        // Respond with a success message
        res.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Handle user login
app.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!user) {
            return res.status(401).json({ message: info.message });
        }

        // Check if the provided password is correct
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ sub: user.id }, JWT_SECRET);

        return res.json({ token });
    })(req, res, next);
});


app.get('/personal-account', passport.authenticate('jwt', { session: false }), (req, res) => {
    // If the user reaches this route, it means they are authenticated
    res.json({ message: 'You have access to your personal account.' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
