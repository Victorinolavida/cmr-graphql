const { gql } = require('apollo-server');
require('dotenv').config('.env')
const jwt = require('jsonwebtoken');
const Usuario = require('../../models/Usuario');
const bcrypjs = require('bcryptjs');
const generateJWT = require('../../helpers/generateJWT');


const typeDefs = gql`
  
  type User {
    id: ID
    _id:ID
    nombre: String
    apellido: String
    email: String
  }

  input AuthInput{
    email:String!
    password: String!
  }

  input UserInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }
  
  type Token {
    token: String
  }
  
  type Query {
    #getUser(token: String!) : User
    getUser : User

  }

  type Mutation {
    #Usuarios
    newUser(input:UserInput!): User
    authUser(input: AuthInput!): Token
  
  }

`;

const resolvers = {
  Query: {
    getUser: async (_, { }, ctx) => {
      // const userID = await jwt.verify(token, process.env.KEY_WORD)
      return ctx;
    },
  }, Mutation: {
    newUser: async (_, { input }, ctx) => {

      const { email } = input;


      let user = await Usuario.findOne({ email });

      if (user) throw new Error('Ya existe un usuario con este email');


      user = new Usuario(input);

      user.password = bcrypjs.hashSync(user.password, 10);


      await user.save();

      return user;

    },
    authUser: async (_, { input }) => {

      const { email, password } = input;

      const user = await Usuario.findOne({ email });

      if (!user) throw new Error('email o password incorrecto, intenta otra vez')

      if (!bcrypjs.compareSync(password, user.password)) {
        throw new Error('email o password incorrecto, intenta otra vez')
      }
      const token = generateJWT(user, process.env.KEY_WORD, '24h')
      return { token }
    }

  }
}

module.exports = {
  typeDefs,
  resolvers
}