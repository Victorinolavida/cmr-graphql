const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  existencias: {
    type: Number,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
    trim: true
  },
  creado: {
    type: Date,
    default: Date.now()
  }

})

module.exports = mongoose.model('Product', productSchema)