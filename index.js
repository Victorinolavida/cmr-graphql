const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken')
require('dotenv').config('.env')


//Schema graphql
// const typeDefs = require('./db/schema');

//Resolvers

// const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');

//db connection 
connectDB()

//server
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: async ({ req }) => {

//     const token = req.headers['authorization'] || '';

//     if (token) {
//       try {
//         const userID = await jwt.verify(token, process.env.KEY_WORD)

//         return userID

//       } catch (error) {
//         console.log(error)
//       }
//     }



//   }
// });

const server = new ApolloServer({
  modules: [
    require('./modules/user'),
    require('./modules/product'),
    require('./modules/client'),
    require('./modules/pedidos')
  ],
  typeDefs:
    [
      require('./modules/user'),
      require('./modules/product'),
      require('./modules/client'),
      require('./modules/pedidos')
    ],
  context: async ({ req }) => {

    const token = req.headers['authorization'];
    if (token) {
      try {
        const data = jwt.decode(token, process.env.KEY_WORD);

        return data;

      } catch (error) {

        console.log(error)
        // throw new Error(error.message);
      }
    }
  }
});

//stating server
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server listen on ${url}`)
})
