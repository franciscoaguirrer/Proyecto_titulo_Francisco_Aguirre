const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: "" },

    // Precio base referencial (cotización puede modificar el precio final)
    precioBase: { type: Number, required: true, min: 0 },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Índice único solo para activos (permite reutilizar nombre si quedó inactivo)
servicioSchema.index(
  { nombre: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

module.exports = mongoose.model("Servicio", servicioSchema);