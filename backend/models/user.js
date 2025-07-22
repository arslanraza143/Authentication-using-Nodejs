const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:27017/auth`)
.then(()=>{
    console.log('✅ MongoDB connected successfully');
})
.catch((err)=>{
    console.error('❌ MongoDB connection error:', err);
});

const userSchema = mongoose.Schema({
    username: String,
    email:    String,
    password:  String,
    age:      Number
});

module.exports = mongoose.model('user', userSchema);