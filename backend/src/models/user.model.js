const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "operador"], default: "operador" },
    active: { type: Boolean, default: true },

    // Campos para recuperación de contraseña
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);