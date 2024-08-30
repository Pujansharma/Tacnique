const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require("dotenv").config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MongoURl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const User = mongoose.model('User', new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    department: String,
}));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Middleware to check if the ID is valid
function checkValidObjectId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ message: 'Invalid ID format' });
    }
    next();
}


// Get all users with pagination
app.get('/users', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    try {
        const users = await User.find()
            .sort({ _id: -1 }) // Sort by _id in descending order
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalUsers = await User.countDocuments();
        res.send({ users, totalUsers });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching users' });
    }
});



// Get a specific user by ID
app.get('/users/:id', checkValidObjectId, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    res.send(user);
});


// Create a new user
app.post('/users', async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.send(user);
});

app.delete('/users/:id', checkValidObjectId, async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    res.send({ message: 'User deleted' });
});

app.put('/users/:id', checkValidObjectId, async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }
    res.send(user);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
