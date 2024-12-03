import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb";
import { ProjectModel, TaskModel, UserModel } from "./types.ts";

const url = Deno.env.get("MONGO_URL")

if(!url){
  console.log("MONGO_URL is not set")
}

const client = new MongoClient(url!)

await client.connect()
console.info("Connected to MongoDB")

const db = client.db("p4")
const UsersCollection = db.collection<UserModel>("users")
const ProjectsCollection = db.collection<ProjectModel>("projects")
const TasksCollection = db.collection<TaskModel>("tasks")

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if (method === "GET"){
    
  }else if(method === "POST"){
    
  }else if(method === "PUT"){
    
  }else if(method === "DELETE"){
    
  }

  return new Response("Ruta errónea", { status: 404 });
};

Deno.serve({port: 8080}, handler)