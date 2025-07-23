const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Middleware - Order is important!
app.use(express.json());
app.use(cookieParser());

// CORS configuration - Fixed and simplified
const corsOptions = {
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:3000', 
        'http://192.168.0.192:3000',
        'http://localhost:54321',
        'http://127.0.0.1:54321',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:61631',
        
    ],
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});



// Routes
app.get('/', function(req, res) {
    res.send('Server is running');
});

app.post('/create', function(req, res) {
    let {username, email, password, age} = req.body;
    
    console.log('Create user request received:', { username, email, age });
    
    if (!username || !email || !password || !age) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                console.error('Salt generation error:', err);
                return res.status(500).json({ error: 'Password processing failed' });
            }
            
            bcrypt.hash(password, salt, async function(err, hash) {
                if (err) {
                    console.error('Hash generation error:', err);
                    return res.status(500).json({ error: 'Password processing failed' });
                }
                
                try {
                    let createdUser = await userModel.create({
                        username,
                        email,
                        password: hash,
                        age
                    });
                    
                    // JWT token creation
                    let token = jwt.sign(
                        { email: email, id: createdUser._id }, 
                        'secret', 
                        { expiresIn: '1h' }
                    );
                    
                    // Set cookie with token
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production', // True if in production (use https)
                        sameSite: 'lax',
                        maxAge: 3600000,
                        path: '/'
                    });
                    
                    console.log('User created successfully:', {
                        id: createdUser._id,
                        username: createdUser.username,
                        email: createdUser.email
                    });
                    
                    return res.status(201).json({
                        message: 'User created successfully',
                        user: {
                            id: createdUser._id,
                            username: createdUser.username,
                            email: createdUser.email
                        }
                    });
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    return res.status(500).json({ error: 'Database error occurred' });
                }
            });
        });
    } catch (error) {
        console.error('Create user error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/logout', function(req, res) {
    console.log('Logout request received');
    
    // Clear the 'token' cookie
    res.cookie('token', '', { 
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
    });

    console.log('User logged out successfully');
    res.status(200).json({ message: 'Logged out successfully' });
});

app.post('/login', async function(req, res) {
    try {
        let {email, password} = req.body;
        
        console.log('Login attempt for email:', email);
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        let user = await userModel.findOne({email});
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const result = await bcrypt.compare(password, user.password);
        if (result) {
            // Create JWT token
            let token = jwt.sign(
                { email: user.email, id: user._id }, 
                'secret', 
                { expiresIn: '1h' }
            );
            
            // Set cookies and response
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production', // True if in production (use https)
                maxAge: 3600000,
                path: '/'
            });
            
            console.log('Login successful for:', email);
            console.log('Token set in cookie');
            
            return res.status(200).json({
                message: 'Login Successfully',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });   
        } else {
            console.log('Invalid password for:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// app.get('/whoami', function(req, res) {
//     if (req.cookies.token) {
//         try {
//             const decoded = jwt.verify(req.cookies.token, 'secret');
//             return res.json({ loggedIn: true, user: decoded });
//         } catch (err) {
//             console.log('Token verification failed:', err.message);
//             return res.status(401).json({ loggedIn: false, error: 'Invalid token' });
//         }
//     } else {
//         console.log('No token found in cookies');
//         return res.status(401).json({ loggedIn: false, error: 'No token found' });
//     }
// });


// Error handling middleware - Must be last
app.use(function(err, req, res, next) {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = 3000;
app.listen(PORT, function() {
    console.log(`Server running on http://192.168.0.192:${PORT}`);
});