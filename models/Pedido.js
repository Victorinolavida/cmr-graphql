const mongoose = require('mongoose')

const pedidoSchema = mongoose.Schema({
  pedido: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  estado: {
    type: String,
    default: 'PENDIENTE'
  },
  creado: {
    type: Date,
    default: Date.now()
  }

})

module.exports = mongoose.model('Pedido', pedidoSchema)