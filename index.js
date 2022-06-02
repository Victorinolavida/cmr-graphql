const { ApolloServer } = require('apollo-server');
require('dotenv').config('.env')
const jwt = require('jsonwebtoken')


//Schema graphql
const typeDefs = require('./db/schema');

//Resolvers

const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');

//db connection 
connectDB()

//server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {

    const token = req.headers['authorization'] || '';

    if (token) {
      try {
        const userID = await jwt.verify(token, process.env.KEY_WORD)

        return userID

      } catch (error) {
        console.log(error)
      }
    }



  }
});


//stating server
server.listen().then(({ url }) => {
  console.log(`Server listen on ${url}`)
})