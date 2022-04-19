const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require("path");

const loadConfigs = () => {
    dotenv.config({path: path.resolve(__dirname, '../.env')});
}

// TODO usunac ten userSchema

const userSchema = new mongoose.Schema({
    name: String
});

const User = mongoose.model('User', userSchema);


const connectToMongoDB = async () => {
    await mongoose.connect(process.env.DB_URL);
    console.log('DB connection successful');
    const users = await User.find();
    console.log(users);
}

module.exports =  () => new Promise(async (resolve, reject) => {
    try {
        loadConfigs();
        await connectToMongoDB();
        resolve();
    } catch (e) {
        reject(e);
    }
});
