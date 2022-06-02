// const cursos = [
//   {
//     titulo: 'JavaScript Moderno Guía Definitiva Construye +10 Proyectos',
//     tecnologia: 'JavaScript ES6',
//   },
//   {
//     titulo: 'React – La Guía Completa: Hooks Context Redux MERN +15 Apps',
//     tecnologia: 'React',
//   },
//   {
//     titulo: 'Node.js – Bootcamp Desarrollo Web inc. MVC y REST API’s',
//     tecnologia: 'Node.js'
//   },
//   {
//     titulo: 'ReactJS Avanzado – FullStack React GraphQL y Apollo',
//     tecnologia: 'React'
//   }
// ];

const Usuario = require('../models/Usuario')
const Product = require('../models/Product');
const Client = require('../models/Client');



const bcrypjs = require('bcryptjs')

require('dotenv').config('.env')

const jwt = require('jsonwebtoken')


const generateJWT = (user, key, time) => {

  const { _id, email, nombre, apellido } = user;

  return jwt.sign({ id: _id, email, nombre, apellido }, key, { expiresIn: time })
}

const resolvers = {
  // Query: {
  //   getCourses: (_, { input }, ctx) => {

  //     console.log(ctx)
  //     const course = cursos.filter(curso => curso.tecnologia === input.tecnologia)

  //     return course

  //   },
  //   getTecnologies: () => cursos
  // },
  Query: {
    getUser: async (_, { token }, ctx) => {
      const userID = await jwt.verify(token, process.env.KEY_WORD)

      return userID
    },
    getProducts: async () => {
      try {
        const products = await Product.find({})

        return products
      } catch (error) {
        console.log(error)
      }
    },
    getProduct: async (_, { id }) => {
      const product = await Product.findById(id);
      if (!product) throw new Error('El producto no existe')
      return product;
    },
    getClients: async () => {

      try {
        const clients = await Client.find({})

        return clients;


      } catch (error) {
        console.log(error)
      }

    },
    getClientsBySeller: async (_, { }, ctx) => {


      try {
        const { id } = ctx;

        console.log(id)

        const clients = await Client.find({ vendedor: id })

        return clients
      } catch (error) {
        console.log(error)
      }

    },
    getClient: async (_, { id }, ctx) => {

      try {
        const existInDb = await Client.findById(id);



        if (!existInDb) throw new Error('El cliente no existe')

        if (existInDb.vendedor.toString() !== ctx.id) {
          throw new Error('No tienes permiso para ver este cliente ')
        }

        return existInDb;

      } catch (error) {
        console.log(error)
      }
    }
  },
  Mutation: {
    newUser: async (_, { input }) => {

      const { email, password } = input;

      //exister user
      const existUser = await Usuario.findOne({ email })

      if (existUser) {
        throw new Error('El usuario ya esta registado')
      }

      //hahear el password
      const salt = await bcrypjs.genSalt(10);
      input.password = await bcrypjs.hash(password, salt)

      //guardndo en db
      try {
        const usuario = new Usuario(input);
        await usuario.save()
        return usuario;
      } catch (error) {
        console.log(error)
      }


    },
    authUser: async (_, { input }) => {
      const { email, password } = input

      //si el usuario existe

      const existUser = await Usuario.findOne({ email })


      if (!existUser) {
        throw new Error('el usuario No existe')
      }

      //validar password

      const passwordRight = bcrypjs.compare(password, existUser.password)

      if (!passwordRight) {
        throw new Error('password incorrecto')
      }

      return {
        token: generateJWT(existUser, process.env.KEY_WORD, '24h')
      }

    },
    newProduct: async (_, { input }) => {
      try {
        const newProduct = new Product(input)

        //guardando en db
        const productSaved = await newProduct.save()

        return productSaved;
      } catch (error) {
        console.log(error)
      }
    },
    updateProduct: async (_, { id, input }) => {

      const oldProduct = Product.findById(id);

      if (!oldProduct) throw new Error('el Producto no existe')

      //guardando en bd

      const newProduct = await Product.findOneAndUpdate({ _id: id, input }, { new: true })

      return newProduct

    },
    deleteProduct: async (_, { id }) => {

      const product = await Product.findById(id);

      if (!product) throw new Error('El producto no existe')

      await Product.findOneAndDelete({ _id: id })

      return 'Producto eliminado'

    },
    newClient: async (_, { input }, ctx) => {
      const { email } = input
      //verificar si ya existe cleinte
      let client = await Client.findOne({ email });

      if (client) throw new Error('El cliente ya existe')


      client = new Client(input)

      client.vendedor = ctx.id

      await client.save()

      return client
    },
    updateClient: async (_, { id, input }, ctx) => {

      try {
        const oldClient = await Client.findById(id);

        if (!oldClient) throw new Error('El cliente no existe')

        if (oldClient.vendedor.toString() !== ctx.id) {
          throw new Error('No tienes permiso para ver este cliente')
        }

        const { vendedor, ...rest } = input;

        const newClient = await Client.findOneAndUpdate({ _id: id }, rest, { new: true })

        return newClient


      } catch (error) {
        console.log(error)
      }




    },
    deleteClient: async (_, { id }, ctx) => {

      try {
        const oldClient = await Client.findById(id);

        if (!oldClient) throw new Error('El cliente no existe')

        if (oldClient.vendedor.toString() !== ctx.id) {
          throw new Error('No tienes permiso para ver este cliente')
        }



        await Client.findByIdAndDelete(id)

        return 'cliente eliminado correctamente'


      } catch (error) {
        console.log(error)
      }
    }

  }


}



module.exports = resolvers