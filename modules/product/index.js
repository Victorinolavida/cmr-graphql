const { gql } = require('apollo-server');
const Product = require('../../models/Product');

const typeDefs = gql`
  


  type Product{
    id:ID
    nombre:String
    existencias: Int
    precio: Float
    creado: String
  }


  input ProductInput{
    nombre:String!
    existencias: Int!
    precio: Float!
  }



  extend type Query {
  

    getProducts:[Product]
    getProduct(id:ID!):Product
    getProductByName(texto:String!):[Product]

  }

  extend type Mutation {
    
  
    newProduct(input:ProductInput!): Product 
    updateProduct(id:ID!, input:ProductInput!): Product
    deleteProduct(id:ID!):String

  }


`;

const resolvers = {

  Query: {
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
    getProductByName: async (_, { texto }) => {
      const products = await Product.find({ $text: { $search: texto } });

      return products;
    }

  },
  Mutation: {
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

      const newProduct = await Product.findOneAndUpdate({ _id: id }, input, { new: true })

      return newProduct

    },
    deleteProduct: async (_, { id }) => {

      const product = await Product.findById(id);

      if (!product) throw new Error('El producto no existe')

      await Product.findOneAndDelete({ _id: id })

      return 'Producto eliminado'

    }

  }


}

module.exports = { typeDefs, resolvers }