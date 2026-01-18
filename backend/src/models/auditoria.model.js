const mongoose = require("mongoose");

const auditoriaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    accion: {
      type: String,
      required: true,
      trim: true
    },
    modulo: {
      type: String,
      required: true,
      trim: true
    },
    detalle: {
      type: String,
      trim: true
    },
    metadata: {
      type: Object
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auditoria", auditoriaSchema);