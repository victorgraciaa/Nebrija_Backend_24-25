export const schema = `#graphql

    type Restaurante {
        id: ID!
        nombre: String!
        direccion: String!,
        numTfno: String!
        temperatura: Int!
        hora: String!
    }

    type Query {
        getRestaurant(id: String!): Restaurante
        getRestaurants(ciudad: String!): [Restaurante!]! 
    }

    type Mutation {
        addRestaurant(nombre: String!, direccion: String!, ciudad: String!, numTfno: String!): Restaurante!
        deleteRestaurant(id: String!): Boolean!
    }

`