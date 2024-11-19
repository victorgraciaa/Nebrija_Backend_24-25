import { MongoClient } from "mongodb"
import { TaskModel } from "./types.ts";
import { ObjectId } from "mongodb";
import { checkTaskExist } from "./utils.ts";

const url = Deno.env.get("MONGO_URL")

if(!url){
  console.log("MONGO_URL is not set")
  Deno.exit(1)
}

const client = new MongoClient(url)

await client.connect()
console.info("Connected to MongoDB")

const db = client.db("p3")
const TasksCollection = db.collection<TaskModel>("tasks")

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;

  if (method === "GET"){
    if(path === "/tasks"){
      const tasks = await TasksCollection.find({}).toArray()

      return new Response(JSON.stringify(tasks), {status: 200})

    }else if(path.startsWith("/tasks/")){
        const idTask:string = path.split("/tasks/")[1]

        if(idTask.length != 24){
            return new Response("Tarea no encontrada", {status: 404})
        }

        const task = await TasksCollection.findOne({_id: new ObjectId(idTask)})

        if(!task){
            return new Response("Tarea no encontrada", {status: 404})
        }

        return new Response(JSON.stringify(task), {status: 200})
    }
  }else if(method === "POST"){
    if(path === "/tasks"){
        const data = await req.json()
        if(!data.title){
            return new Response("Se requiere especificar el nombre de la tarea", {status: 400})
        }

        const insertedTask = await TasksCollection.insertOne({
            _id: new ObjectId,
            title: data.title,
            completed: false
        })


        const task = await TasksCollection.findOne({_id: insertedTask.insertedId})

        return new Response(JSON.stringify(task), {status: 200})
    }
    

  }else if(method === "PUT"){
    if(path.startsWith("/tasks/")){
        const idTask:string = path.split("/tasks/")[1]

        if(idTask.length != 24){
            return new Response("Tarea no encontrada", {status: 404})
        }

        if(!checkTaskExist(new ObjectId(idTask), TasksCollection)){
            return new Response("Tarea no encontrada", {status: 404})
        }

        const data = await req.json()
        const campos = Object.keys(data)

        if(!campos.includes("completed")){
            return new Response("Se requiere especificar el estado de la tarea", {status: 400})
        }

        await TasksCollection.updateOne({_id: new ObjectId(idTask)}, 
            {$set: {
                completed: data.completed
            }}
        )

        const updatedTask = await TasksCollection.findOne({_id: new ObjectId(idTask)})
        if(!updatedTask){
            return new Response("Tarea no encontrada", {status: 404})
        }

        return new Response(JSON.stringify(updatedTask), {status: 200})

    }
    

  }else if(method === "DELETE"){
    if(path.startsWith("/tasks/")){
        const idTask:string = path.split("/tasks/")[1]

        if(idTask.length != 24){
            return new Response("Tarea no encontrada", {status: 404})
        }

        if(!checkTaskExist(new ObjectId(idTask), TasksCollection)){
            return new Response("Tarea no encontrada", {status: 404})
        }

        await TasksCollection.deleteOne({_id: new ObjectId(idTask)})

        return new Response("Tarea eliminada correctamente", {status: 200})
    }

  }

  return new Response("Ruta errónea", { status: 404 });
};

Deno.serve({port: 3000}, handler)