import { MongoClient } from "mongodb";
import { UserModel, PostModel, CommentModel } from "./types.ts";
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";


const urlMongo = Deno.env.get("MONGO_URL")

if(!urlMongo){
    throw new Error("MONGO_URL not found")
}

const cliente = new MongoClient(urlMongo)

await cliente.connect()
console.info("Connected to MongoDB")

const db = cliente.db("p5")
const UsersCollection = db.collection<UserModel>("users")
const PostsCollection = db.collection<PostModel>("posts")
const CommentsCollection = db.collection<CommentModel>("comments")

const server = new ApolloServer({
    typeDefs: schema,
    resolvers
})

const { url } = await startStandaloneServer(server, {
    context: async () => ({ UsersCollection, PostsCollection, CommentsCollection }), listen: {port: 8080}
},)

console.info(`Server ready at ${url}`)