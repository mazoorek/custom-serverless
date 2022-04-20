const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require("path");

const loadConfigs = () => {
    dotenv.config({path: path.resolve(__dirname, '../.env')});
}



const connectToMongoDB = async () => {
    await mongoose.connect(process.env.DB_URL);
    console.log('DB connection successful');
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
