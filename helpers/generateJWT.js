const jwt = require('jsonwebtoken');

const generateJWT = (user, key, time) => {

  const { _id, email, nombre, apellido } = user;

  const token = jwt.sign({ id: _id, email, nombre, apellido }, key, { expiresIn: time })

  return token
}

module.exports = generateJWT