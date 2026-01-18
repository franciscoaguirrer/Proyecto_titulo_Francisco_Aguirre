require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "admin@makingtrips.cl";
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("ℹ️ Admin ya existe:", email);
    process.exit(0);
  }

  const hash = await bcrypt.hash("123456", 10);

  await User.create({
    email,
    password: hash,
    role: "admin"
  });

  console.log("✅ Admin creado: admin@makingtrips.cl / 123456");
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});