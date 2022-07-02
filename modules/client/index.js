const { gql } = require('apollo-server')
const Client = require('../../models/Client')


const typeDefs = gql`
  
  type Client{
    nombre: String
    apellido: String
    email: String
    empresa: String
    telefono: String
    creado: String
    vendedor: ID
    id:ID
  }

  

  input ClientInput{
    nombre: String!
    apellido: String!
    email: String!
    empresa: String!
    telefono: String
  }

  extend type Query {
    getClients : [Client]
    getClientsBySeller:[Client]
    getClient(id:ID!):Client

  }

  extend type Mutation {
    newClient(input: ClientInput!): Client
    updateClient(id:ID!, input:ClientInput!):Client
    deleteClient(id:ID!):String
  
  }


`;


const resolvers = {

  Query: {
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

module.exports = { typeDefs, resolvers }