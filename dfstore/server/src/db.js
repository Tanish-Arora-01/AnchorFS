const mongoose = require('mongoose');

async function connectMongo(uri) {
mongoose.set('strictQuery', true);
await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
mongoose.connection.on('error', (err) => console.error('Mongo error:', err));
mongoose.connection.on('disconnected', () => console.warn('Mongo disconnected'));
console.log('Mongo connected');
}

module.exports = { connectMongo }