import { MongoClient } from "mongodb"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { resolvers } from "./resolvers.ts";
import { schema } from "./schema.ts";

const MONGO_URL = Deno.env.get("MONGO_URL")
if(!MONGO_URL){
  throw new Error("MONGO_URL not found")
}

const cliente = new MongoClient(MONGO_URL)
await cliente.connect()

console.info("Connected to MongoDB")

const db = cliente.db("ordinaria")
const ExampleCollection = db.collection("ExampleCollection")

//API Rest
/*
const handler = async (req: Request): Promise<Response> => {

  const method = req.method
  const url = new URL(req.url)
  const path = url.pathname

  if(method === "GET"){
    if(path === "/hola"){
      return new Response("Hola!", {status: 200})
    }
    else if(path === "/"){

    }
  }
  else if(method === "POST"){

  }
  else if(method === "PUT"){

  }
  else if(method === "DELETE"){

  }

  return new Response("Endpoint not found", {status: 404})
}

Deno.serve({port: 8080}, handler)
*/
//GraphQL

const server = new ApolloServer({
  typeDefs: schema,
  resolvers
})

const { url }= await startStandaloneServer(server, {
  context: async () => ({  }), listen: {port: 8080}
})

console.info(`Server ready at ${url}`)
