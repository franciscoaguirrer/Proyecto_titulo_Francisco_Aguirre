const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("No existe la variable MONGO_URI en el archivo .env");
  }

  await mongoose.connect(uri);
  console.log("✅ MongoDB conectado");
}

module.exports = { connectDB };