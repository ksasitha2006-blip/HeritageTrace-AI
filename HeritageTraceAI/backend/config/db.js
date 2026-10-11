const dns = require('node:dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/heritagetrace';

  if (uri.startsWith('mongodb+srv://')) {
    const srvRecord = `_mongodb._tcp.${new URL(uri.replace(/^mongodb\+srv:/i, 'https:')).hostname}`;
    try {
      await dns.promises.resolveSrv(srvRecord);
    } catch (error) {
      if (error.code !== 'ECONNREFUSED') throw error;

      const fallbackServers = (process.env.MONGO_DNS_SERVERS || '8.8.8.8')
        .split(',')
        .map((server) => server.trim())
        .filter(Boolean);
      if (fallbackServers.length === 0) {
        throw new Error('MONGO_DNS_SERVERS must contain at least one DNS server.');
      }

      dns.setServers(fallbackServers);
      console.warn(
        `System DNS refused the MongoDB SRV lookup; retrying with configured fallback DNS server(s): ${fallbackServers.join(', ')}.`,
      );
      await dns.promises.resolveSrv(srvRecord);
    }
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

module.exports = connectDB;