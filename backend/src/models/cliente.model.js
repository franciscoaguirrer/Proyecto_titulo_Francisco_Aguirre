const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    rut: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    telefono: { type: String, required: true, trim: true },
    direccion: { type: String, trim: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cliente", clienteSchema);