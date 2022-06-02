const { gql } = require('apollo-server')

const typeDefs = gql`
  
 
  type User {
    id: ID
    nombre: String
    apellido: String
    email: String
  }


  input UserInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }
  
  input AuthInput{
    email:String!
    password: String!
  }

  type Token {
    token: String
  }



  type Product{
    id:ID
    nombre:String
    existencias: Int
    precio: Float
    creado: String
  }
  type Client{
    nombre: String
    apellido: String
    email: String
    empresa: String
    telefono: String
    creado: String
    vendedor: ID
  }

  input ProductInput{
    nombre:String!
    existencias: Int!
    precio: Float!
  }

  input ClientInput{
    nombre: String!
    apellido: String!
    email: String!
    empresa: String!
    telefono: String
    vendedor: ID
  }

  type Query {
    getUser(token: String!) : User

    #productos
    getProducts:[Product]
    getProduct(id:ID!):Product


    #clientes
    getClients : [Client]
    getClientsBySeller:[Client]
    getClient(id:ID!):Client

  }

  type Mutation {
    #Usuarios
    newUser(input:UserInput): User
    authUser(input: AuthInput): Token
  
    #productos
    newProduct(input:ProductInput!): Product 
    updateProduct(id:ID!, input:ProductInput!): Product
    deleteProduct(id:ID!):String
  
  
    #clientes
    newClient(input: ClientInput!): Client
    updateClient(id:ID!, input:ClientInput!):Client
    deleteClient(id:ID!):String
  
  
  }


`;

module.exports = typeDefs