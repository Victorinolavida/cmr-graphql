const { gql } = require('apollo-server');
const Client = require('../../models/Client');
const Product = require('../../models/Product');
const Pedido = require('../../models/Pedido');


const typeDefs = gql`
 
  input PedidoProductInput{
    id:ID
    cantidad: Int!
    nombre: String!
    precio: Float!
  }

  input inputPedido{
    pedido:[PedidoProductInput]
    total:Float
    client:ID!
    estado: StatePedido
  }

  enum StatePedido{
    PENDIENTE
    COMPLETADO
    CANCELADO
  }


  type Pedido{
    id:ID
    pedido:[PedidoGroup]
    total:Float
    vendedor:ID
    client:Client
    creado:String
    estado: StatePedido
  }

  type PedidoGroup{
    id:ID
    cantidad:Int
    nombre:String
    precio:Float
  }

  type TopClient{
    total: Float
    client:[Client]

  }
  

  type TopSeller{
    total:Float
    seller:[User]
  }


  extend type Query {
    getPedidos: [Pedido]
    getPedidosBySeller:[Pedido]
    getPedidoById(id:ID!): Pedido
    getPedidosByState(state:String!):[Pedido]
    

    #busquedas
    TopClient:[TopClient]
    TopSellers:[TopSeller]
    
  }

  type Test{
    test:String
  }

  extend type Mutation {
    newPedido(input: inputPedido):Pedido
    updatePedido(id:ID!,input:inputPedido!):Pedido
    deletePedido(id:ID!):String
  }

`;


const resolvers = {

  Query: {
    getPedidos: async () => {
      try {
        const pedidos = await Pedido.find();
        return pedidos
      } catch (error) {
        console.log(error)
      }
    },
    getPedidosBySeller: async (_, { }, ctx) => {

      const { id } = ctx;

      try {
        const pedidos = await Pedido.find({ vendedor: id },).populate('client');

        return pedidos

      } catch (error) {
        console.log(error)
      }




    },
    getPedidoById: async (_, { id }, ctx) => {

      const pedido = await Pedido.findById(id);

      if (!pedido) throw new Error('El pedido no existe');

      if (pedido.vendedor.toString() !== ctx.id) throw new Error('No tienes permiso para usar este servicio')


      return pedido


    },
    getPedidosByState: async (_, { state }, ctx) => {
      const pedidos = await Pedido.find({ vendedor: ctx.id, estado: state })
      return pedidos
    },
    TopClient: async () => {
      const clientes = await Pedido.aggregate([
        { $match: { estado: "COMPLETADO" } },
        {
          $group: {
            _id: "$client",
            total: { $sum: "$total" }
          }
        },
        {
          $lookup: {
            from: 'clients',
            localField: "_id",
            foreignField: "_id",
            as: "client"
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);

      return clientes
    },
    TopSellers: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: { estado: 'COMPLETADO' } },
        {
          $group: {
            _id: "$vendedor",
            total: { $sum: "$total" }
          }
        },
        {
          $lookup: {
            from: 'usuarios',
            localField: '_id',
            foreignField: '_id',
            as: 'seller'
          }
        }, {
          $limit: 3
        }, {
          $sort: { total: -1 }
        }
      ])
      return vendedores
    }
  },
  Mutation: {
    newPedido: async (_, { input }, ctx) => {
      const { client } = input;


      //client existe?
      const clienteExist = await Client.findById(client)


      if (!clienteExist) throw new Error('El ciente no existe');

      //verificar si cliente es del vendedor

      if (clienteExist.vendedor.toString() !== ctx.id) throw new Error('No tienes permisos para realizar esta operación')

      //stock disponible
      for await (const product of input.pedido) {

        const { id, cantidad } = product;

        const produtDB = await Product.findById(id)


        if (!produtDB) throw new Error('Producto no existe')

        if (cantidad > produtDB.existencias) {
          throw new Error(`El producto ${produtDB.nombre} excede la cantidad en stock`)
        } else {
          // producto.existencia = producto.existencia + pedido.pedido.cantidad - articulo.cantidad;
          produtDB.existencias = produtDB.existencias - cantidad;
          await produtDB.save()
        }
      }

      //nuevo pedido
      const newPedido = new Pedido(input);

      //asignar vendedor
      newPedido.vendedor = ctx.id;


      //guardar Bd
      await newPedido.save();

      return newPedido
    },
    updatePedido: async (_, { id, input }, ctx) => {

      //pediodo existe

      const pedido = await Pedido.findById(id);

      if (!pedido) throw new Error('El Pedido no existe');

      //ciente existe

      const cliente = await Client.findById(input.client);

      if (!cliente) throw new Error('El cliente no existes');

      // el cliente y pedido pertenecen al vendedor 

      if (ctx.id !== cliente.vendedor.toString() || ctx.id !== pedido.vendedor.toString()) {
        throw new Error('No tienes permisos para realizar esta operación');
      }


      //checando el stock
      if (input.pedido) {
        for await (const product of input.pedido) {
          const { id, cantidad } = product;

          const produtDB = await Product.findById(id)

          if (!produtDB) throw new Error('Producto no existe')

          if (cantidad > produtDB.existencias) {
            throw new Error(`El producto ${produtDB.nombre} excede la cantidad en stock`)
          } else {
            produtDB.existencias = produtDB.existencias - cantidad;
            await produtDB.save()
          }
        }
      }

      const { vendedor, client, ...rest } = input;

      const newPedido = await Pedido.findByIdAndUpdate({ _id: id }, rest, { new: true });


      return newPedido;

    },
    deletePedido: async (_, { id }, ctx) => {

      //si el pedido existencias
      const pedido = await Pedido.findById(id)
      if (!pedido) throw new Error('El Pedido no existe');

      //si el vendedor es el correcto
      if (ctx.id !== pedido.vendedor.toString()) throw new Error('No tienes permisos para realizar esta operación');

      try {
        await Pedido.findOneAndDelete({ _id: id })
      } catch (e) {
        /* handle error */
        console.log(e)
      }
      return 'Pedido eliminado correctamente'
    }
  }


}

module.exports = { typeDefs, resolvers }
