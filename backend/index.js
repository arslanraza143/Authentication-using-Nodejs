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
app.use(cors());

app.get('/', function(req,res){
    res.send('done');
});

app.post('/create', function(req,res){
    
    let {username, email, password, age} = req.body;

    try {
        if(!username || !email || !password || !age){
        return res.status(400).json({ message: 'All fields are required'});
    }else{
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
                let token = jwt.sign({email: email},'secret');
                // set cookie with token
                res.cookie('token', token);
                return res.status(201).json({message: 'User created successfully',})
            });
        });
        // console.log('User created successfully');
        // console.log(req.body);
        
    }
    } catch (error) {
       return res.status(500).send('Internal Server Error');
    }

});

app.get('/logout', function(req, res){
    res.cookie('token', '');
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
            let token = jwt.sign({email: user.email}, 'secret', {expiresIn: '1h'});
            
            // set cookies and response
            res.cookie('token', token,{
                httpOnly: true,
                sameSite: 'Strict',

            });
            return res.status(200).json({message: 'Login Successfully'});    
        }else return res.status(401).json({ message: 'Invalid email or password' });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000);