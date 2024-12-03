import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb";
import { ProjectModel, status, TaskModel, UserModel } from "./types.ts";
import { fromModelToProject, fromModelToTask, fromModelToUser } from "./utils.ts";

const url = Deno.env.get("MONGO_URL")

if(!url){
  throw new Error("MONGO_URL is not set")
}

const client = new MongoClient(url)

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
    if(path === "/users"){
      const users = await UsersCollection.find().toArray()

      return new Response(JSON.stringify(users.map((elem) => fromModelToUser(elem))), {status: 200})
    }
    else if(path === "/projects"){
      const projects = await ProjectsCollection.find().toArray()

      return new Response(JSON.stringify(projects.map((elem) => fromModelToProject(elem))), {status: 200})
    }
    else if(path === "/tasks"){
      const tasks = await TasksCollection.find().toArray()

      return new Response(JSON.stringify(tasks.map((elem) => fromModelToTask(elem))), {status: 200})
    }
    else if(path === "/tasks/by-project"){
      const id = url.searchParams.get("project_id")
      if(!id){
        return new Response("ID necesario", {status: 400})
      }

      const tasks = await TasksCollection.find({project_id: new ObjectId(id)}).toArray()

      return new Response(JSON.stringify(tasks.map((elem) => {
        return {
          id: elem._id.toString(),
          title: elem.title,
          description: elem.description,
          status: elem.status,
          created_at: elem.created_at,
          due_date: elem.due_date
        }
      })))
    }
    else if(path === "/projects/by-user"){
      const id = url.searchParams.get("user_id")
      if(!id){
        return new Response("ID necesario", {status: 400})
      }

      const projects = await ProjectsCollection.find({user_id: new ObjectId(id)}).toArray()

      return new Response(JSON.stringify(projects.map((elem) => {
        return {
          id: elem._id.toString(),
          name: elem.name,
          description: elem.description,
          start_date: elem.start_date,
          end_date: elem.end_date
        }
      })))
    }
    
  }else if(method === "POST"){
    if(path === "/users"){
      const data = await req.json()
      if(!data.name || !data.email){
        return new Response("Nombre y email del usuarios son necesarios", {status: 400})
      }

      if(await UsersCollection.findOne({email: data.email})){
        return new Response("Email ya registrado", {status: 400})
      }

      const nuevoUsuario = await UsersCollection.insertOne({
        name: data.name,
        email: data.email,
        created_at: new Date
      })

      const user = await UsersCollection.findOne({_id: nuevoUsuario.insertedId})

      return new Response(JSON.stringify(fromModelToUser(user!)), {status: 200})
    }
    else if(path === "/projects"){
      const data = await req.json()
      if(!data.name || !data.description || !data.start_date || !data.user_id){
        return new Response("Nombre, descripción del proyecto, fecha de comienzo e ID del usuario del proyecto son necesarios", {status: 400})
      }

      if(!await UsersCollection.findOne({_id: new ObjectId(data.user_id)})){
        return new Response("Usuario del proyecto no encontrado", {status: 404})
      }

      const fechaInicio = Date.parse(data.start_date)
      if(isNaN(fechaInicio)){
        return new Response("Formato de fecha no válido. El formato debe ser YYYY/MM/DD")
      }

      const nuevoProyecto = await ProjectsCollection.insertOne({
        name: data.name,
        description: data.description,
        start_date: new Date(fechaInicio),
        end_date: null,
        user_id: new ObjectId(data.user_id)
      })

      const project = await ProjectsCollection.findOne({_id: nuevoProyecto.insertedId})

      return new Response(JSON.stringify(fromModelToProject(project!)), {status: 200})
    }
    else if(path === "/tasks"){
      const data = await req.json()
      if(!data.title || !data.description || !data.status || !data.due_date || !data.project_id){
        return new Response ("Título, descripción de la tarea, estado, fecha de fin e ID del proyecto son necesarios", {status: 400})
      }

      if(!Object.values(status).includes(data.status)){
        return new Response("El estado de la tarea debe ser: pending, in_progress o completed", {status: 400})
      }

      if(!await ProjectsCollection.findOne({_id: new ObjectId(data.project_id)})){
        return new Response("Proyecto no encontrado")
      }

      const fechaFin = Date.parse(data.due_date)
      if(isNaN(fechaFin)){
        return new Response("Formato de fecha no válido. El formato debe ser YYYY/MM/DD")
      }

      const nuevaTarea = await TasksCollection.insertOne({
        title: data.title,
        description: data.description,
        status: data.status,
        created_at: new Date(),
        due_date: new Date (fechaFin),
        project_id: new ObjectId(data.project_id)
      })

      const task = await TasksCollection.findOne({_id: nuevaTarea.insertedId})

      return new Response(JSON.stringify(fromModelToTask(task!)), {status: 200})
    }
    else if(path === "/tasks/move"){
      const data = await req.json()
      if(!data.task_id || !data.destination_project_id){
        return new Response("ID de la tarea e ID del proyecto destino son necesarios", {status: 400})
      }
 
      const task = await TasksCollection.findOne({_id: new ObjectId(data.task_id)})
      if(!task){
        return new Response("Tarea no encontrada", {status: 404})
      }

      if(!await ProjectsCollection.findOne({_id: new ObjectId(data.destination_project_id)})){
        return new Response("Proyecto de destino no encontrado", {status: 404})
      }

      if(data.origin_project_id){
        if(!await ProjectsCollection.findOne({_id: new ObjectId(data.origin_project_id)})){
          return new Response("Proyecto de origen no encontrado", {status: 404})
        }

        if(task.project_id.toString() !== data.origin_project_id){
          return new Response("Proyecto de origen no corresponde a esta tarea", {status: 404})
        }
      }

      await TasksCollection.findOneAndUpdate({_id: new ObjectId(data.task_id)},{$set: {
        project_id: new ObjectId(data.destination_project_id)
      }})

      return new Response(JSON.stringify({
        id: data.task_id,
        title: task.title,
        project_id: data.destination_project_id
      }))
    }
    
    
  }else if(method === "DELETE"){
    if(path === "/users"){
       const id = url.searchParams.get("id")
       if(!id){
        return new Response("ID necesario", {status: 400})
       }
       
       const usuarioBorrado = await UsersCollection.deleteOne({_id: new ObjectId(id)})

       if(usuarioBorrado.deletedCount !== 1){
        return new Response("Usuario no encontrado", {status: 404})
       }

       return new Response("Usuario eliminado", {status: 200})
    }
    else if(path === "/projects"){
      const id = url.searchParams.get("id")

       if(!id){
        return new Response("ID necesario", {status: 400})
       }
       
       const proyectoBorrado = await ProjectsCollection.deleteOne({_id: new ObjectId(id)})

       if(proyectoBorrado.deletedCount !== 1){
        return new Response("Proyecto no encontrado", {status: 404})
       }

       return new Response("Proyecto eliminado", {status: 200})      
    }
    else if(path === "/tasks"){
      const id = url.searchParams.get("id")

       if(!id){
        return new Response("ID necesario", {status: 400})
       }
       
       const tareaBorrada = await TasksCollection.deleteOne({_id: new ObjectId(id)})

       if(tareaBorrada.deletedCount !== 1){
        return new Response("Tarea no encontrada", {status: 404})
       }

       return new Response("Tarea eliminada", {status: 200})      
    }
  }

  return new Response("Ruta errónea", { status: 404 });
};

Deno.serve({port: 8080}, handler)