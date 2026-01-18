const mongoose = require("mongoose");

const reservaItemSchema = new mongoose.Schema(
  {
    servicioId: { type: mongoose.Schema.Types.ObjectId, ref: "Servicio", required: true },
    nombreServicio: { type: String, trim: true, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const reservaSchema = new mongoose.Schema(
  {
    cotizacionId: { type: mongoose.Schema.Types.ObjectId, ref: "Cotizacion", required: true },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },

    // Datos operativos
    fechaServicio: { type: Date, required: true },
    pasajeros: { type: Number, required: true, min: 1 },
    origen: { type: String, required: true, trim: true },
    destino: { type: String, required: true, trim: true },

    // Registo económico
    items: { type: [reservaItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },

    // Estado de la reserva
    estado: {
      type: String,
      enum: ["confirmada", "cancelada", "finalizada"],
      default: "confirmada",
      required: true,
    },

    observaciones: { type: String, trim: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reserva", reservaSchema);