const bcrypt = require("bcrypt");
const User = require("../../models/user.model");

async function createUser({ email, password, role }) {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error("El email ya está registrado");
    err.statusCode = 409;
    throw err;
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hash,
    role: role || "operador",
    active: true,
  });

  return {
    id: user._id,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
}

async function listUsers() {
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
  return users;
}

async function updateUser(id, data) {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, projection: { password: 0 } }
  );

  if (!user) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  return user;
}

async function disableUser(id) {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { active: false } },
    { new: true, projection: { password: 0 } }
  );

  if (!user) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404;
    throw err;
  }

  return user;
}

module.exports = { createUser, listUsers, updateUser, disableUser };