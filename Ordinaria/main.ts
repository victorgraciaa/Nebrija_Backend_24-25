import { MongoClient } from "mongodb"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { resolvers } from "./resolvers.ts";
import { schema } from "./schema.ts";
import { RestauranteModel } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL")
if(!MONGO_URL){
  throw new Error("MONGO_URL not found")
}

const cliente = new MongoClient(MONGO_URL)
await cliente.connect()

console.info("Connected to MongoDB")

const db = cliente.db("ordinaria2425")
const RestaurantesCollection = db.collection<RestauranteModel>("restaurantes")

const server = new ApolloServer({
  typeDefs: schema,
  resolvers
})

const { url }= await startStandaloneServer(server, {
  context: async () => ({ RestaurantesCollection }), listen: {port: 8080}
})

console.info(`Server ready at ${url}`)
