const mongoose = require("mongoose");

const cotizacionItemSchema = new mongoose.Schema(
  {
    servicioId: { type: mongoose.Schema.Types.ObjectId, ref: "Servicio", required: true },

    nombreServicio: { type: String, trim: true, default: "" },

    cantidad: { type: Number, required: true, min: 1, default: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const cotizacionSchema = new mongoose.Schema(
  {
    // Relación: una cotización pertenece a un cliente
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },

    // Datos de la solicitud/cotización
    origen: { type: String, required: true, trim: true },
    destino: { type: String, required: true, trim: true },
    fechaServicio: { type: Date, required: true },
    pasajeros: { type: Number, required: true, min: 1 },

    //Detalle de servicios
    items: { type: [cotizacionItemSchema], default: [] },

    //Total calculado
    total: { type: Number, required: true, min: 0, default: 0 },

    // Estado
    estado: {
      type: String,
      enum: ["pendiente", "aprobada", "rechazada"],
      default: "pendiente",
      required: true,
    },

    // Observaciones internas
    observaciones: { type: String, trim: true, default: "" },

    // Trazabilidad
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Borrado lógico
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cotizacion", cotizacionSchema);