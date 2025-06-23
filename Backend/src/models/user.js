const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password_hash: { 
        type: String,
        required: true
    }
}, { timestamps: true }); 

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
};

userSchema.pre('save', async function(next) {
    if (!this.isModified('password_hash')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

async function loginUser(username, password) {
    try {
        const user = await User.findOne({ username });
        if (user && await user.comparePassword(password)) {
            return { id: user._id, username: user.username };
        }
        return null; 
    } catch (error) {
        console.error('Erro no model loginUser:', error);
        throw error;
    }
}

async function createUser(username, password) {
    try {
        const newUser = new User({ username, password_hash: password }); 
        await newUser.save(); 
        console.log(`Usuário ${username} criado.`);
        return newUser;
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
    }
}

module.exports = { User, loginUser, createUser }; 