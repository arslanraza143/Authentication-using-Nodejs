const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');


//middleware
app.use(express.json());
app.use(cookieParser());
// CORS configuration - Fixed and simplified
// app.use(cors({
//     origin: [
//         'http://localhost:3000', 
//         'http://127.0.0.1:3000', 
//         'http://192.168.0.192:3000',
//         'http://localhost:54321',
//         'http://127.0.0.1:54321',
//         'http://localhost:8080',
//         'http://127.0.0.1:8080',
//         'http://127.0.0.1:61631'
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
//     exposedHeaders: ['Set-Cookie']
// }));

// // Add preflight handling
// app.options('*', cors());
app.use(cors());

app.get('/', function(req, res) {
    res.send('Server is running');
});

app.post('/create', function(req,res){
    
    let {username, email, password, age} = req.body;
    if(!username || !email || !password || !age){
        return res.status(400).json({ message: 'All fields are required'});
        }
    try {
        bcrypt.genSalt(10, function(err, salt){
            //console.log(salt);
            bcrypt.hash(password, salt, async function(err, hash){
                let createdUser = await userModel.create({
                    username,
                    email,
                    password: hash,
                    age
                });
                // jwt token creation
                let token = jwt.sign({email: email, id: createdUser._id},'secret',{expiresIn: '1h'});
                // set cookie with token
                res.cookie('token', token, {
                    httpOnly: true,
                        secure: false, // set to true in production with HTTPS
                        sameSite: 'lax', // Changed from 'None' for better compatibility
                        maxAge: 3600000, // 1 hour in milliseconds
                        path: '/'          // Ensure cookie is available for all paths
                });
                console.log('User created successfully:', createdUser);
                console.log('Token set in cookie:', token); 
                return res.status(201).json({message: 'User created successfully',})
            });
            
        });

    } catch (error) {
       return res.status(500).json({ error: 'Internal Server Error' });
    }

});

app.get('/logout', function(req, res){
    // Clear the 'token' cookie by setting an expired date
    res.cookie('token', '', { 
        httpOnly: true,
        //secure: false, 
        secure: process.env.NODE_ENV === 'production', // Secure flag (only sent over HTTPS in production)
        sameSite: 'lax',  // Adjust based on your needs (None for cross-site cookies, Strict for same-site)
        expires: new Date(0), // Set the expiration date to the past
        path: '/' // Ensure cookie is cleared for all paths
    });

    // Optionally, send a confirmation message
    res.status(200).json({ message: 'Logged out successfully' });
});

app.post('/login',async function(req, res){
    try {
        let {email, password} = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        let user = await userModel.findOne({email})
        if(!user) return res.status(401).json({ message: 'Invalid email or password' });
                const result = await bcrypt.compare(password, user.password);
        if(result) {
            //create json token
            let token = jwt.sign({email: user.email, id: user._id}, 'secret', {expiresIn: '1h'});
            
            // set cookies and response
            res.cookie('token', token,{
                httpOnly: true,
                sameSite: 'None',
                secure: false, // set to true if using https
                maxAge: 3600000, // 1 hour in milliseconds
                path: '/' // Ensure cookie is available for all paths
            });
            console.log('Token set in cookie:', token); 
            return res.status(200).json({message: 'Login Successfully'});   
            
        }else return res.status(401).json({ message: 'Invalid email or password' });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// app.get('/whoami', function(req, res) {
//     console.log('WhoAmI request received');
//     console.log('All cookies received:', req.cookies);
//     console.log('Token cookie:', req.cookies.token);
//     console.log('Request headers cookie:', req.headers.cookie);
    
//     if (req.cookies.token) {
//         try {
//             const decoded = jwt.verify(req.cookies.token, 'secret');
//             console.log('Token verified successfully for:', decoded.email);
//             return res.json({ 
//                 loggedIn: true, 
//                 user: decoded 
//             });
//         } catch (err) {
//             console.log('Token verification failed:', err.message);
//             return res.status(401).json({ 
//                 loggedIn: false, 
//                 error: 'Invalid token' 
//             });
//         }
//     } else {
//         console.log('No token found in cookies');
//         return res.status(401).json({ 
//             loggedIn: false, 
//             error: 'No token found' 
//         });
//     }
// });
// Add error handling middleware
app.use(function(err, req, res, next){
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = 3000;
app.listen(PORT, function() {
    console.log(`Server running on http://192.168.0.192:${PORT}`);
});