import { MongoClient, ObjectId } from "mongodb"
import { PersonaModel } from "./types.ts";

const urlMongo = Deno.env.get("MONGO_URL")

if(!urlMongo){
  console.error("MONGO_URL not set")
  Deno.exit(1)
}

const cliente = new MongoClient(urlMongo)
await cliente.connect()
console.info("Connected to MongoDB")

const db = cliente.db("parcial")
const personas = db.collection<PersonaModel>("personas")

const handler = async (req: Request): Promise<Response> => {
  
  const method = req.method
  const url = new URL(req.url)
  const path = url.pathname

  if(method === "GET"){

    if(path === "/personas"){
      if(url.searchParams.get("nombre")){
        const personasFiltradas =  await personas.find({nombre: url.searchParams.get("nombre")}).toArray()
        return new Response(JSON.stringify(personasFiltradas))
      }

      const pers = await personas.find({}).toArray()
      return new Response(JSON.stringify(pers))
    }
    else if(path === "/persona"){
      if(url.searchParams.get("email")){
        const personasFiltradas =  await personas.find({email: url.searchParams.get("email")}).toArray()
        return new Response(JSON.stringify(personasFiltradas))
      }
    }

    return new Response("Endpoint not found", {status: 404})
  }
  else if(method === "POST"){

    if(path === "/personas"){
      const nuevaPersona:PersonaModel = await req.json()
      if(!nuevaPersona.nombre || !nuevaPersona.email || !nuevaPersona.telefono || !nuevaPersona.amigos){
        new Response("Bad request", {status: 400})
      }
      if(personas.find({email: nuevaPersona.email}) || personas.find({telefono: nuevaPersona.telefono})){
        new Response("El email o el teléfono están ya registrados", {status: 400})
      }

      const {insertedId} = await personas.insertOne({
        _id: new ObjectId,
        nombre: nuevaPersona.nombre,
        email: nuevaPersona.email,
        telefono: nuevaPersona.telefono,
        amigos: nuevaPersona.amigos
      })

      return new Response(JSON.stringify({
        nombre: nuevaPersona.nombre,
        email: nuevaPersona.email,
        telefono: nuevaPersona.telefono,
        amigos: nuevaPersona.amigos
      }), {status: 201})
    }

    return new Response("Endpoint not found", {status: 404})
  }
  else if(method === "PUT"){

    if(path === "/persona"){
      const personaActualizada = await req.json()

      if(!personaActualizada.nombre || !personaActualizada.email || !personaActualizada.telefono || !personaActualizada.amigos){
        new Response("Bad request", {status: 400})
      }

      const {modifiedCount} = await personas.updateOne({email: personaActualizada.email}, {
        $set: {
          email: personaActualizada.email,
          nombre: personaActualizada.nombre,
          telefono: personaActualizada.telefono,
          amigos: personaActualizada.amigos
        }
      })

      if(modifiedCount === 0){
        return new Response("Persona no encontrada", {status: 404})
      }

      return new Response(JSON.stringify({
        email: personaActualizada.email,
        nombre: personaActualizada.nombre,
        telefono: personaActualizada.telefono,
        amigos: personaActualizada.amigos
      }), {status: 200})
    }
    if(path === "/persona/amigo"){
      const personaActualizada = await req.json()
      if(!personaActualizada.personaEmail || !personaActualizada.amigoID){
        return new Response("Bad request", {status: 400})
      }

      const {modifiedCount} = await personas.updateOne({email: personaActualizada.personaEmail}, {
        $push: {
          amigos: personaActualizada.amigoID
        }
      })

      if(modifiedCount === 0){
        return new Response("Persona o amigo no encontrado", {status: 404})
      }

    }
    
    return new Response("Endpoint not found", {status: 404})
  }
  else if(method === "DELETE"){

    if(path === "/persona"){
      const personaBorrada = await req.json()

      if(!personaBorrada.email){
        new Response("Bad request", {status: 400})
      }

      const { deletedCount } = await personas.deleteOne({email: personaBorrada.email})
      const { modifiedCount } = await personas.updateMany({amigos: personaBorrada._id}, {
        $pull: {
          amigos: personaBorrada._id
        }
      })

      if(deletedCount === 0){
        return new Response("Persona no encontrada", {status: 404})
      }

      return new Response("Persona eliminada correctamente", {status: 200})
    }

    return new Response("Endpoint not found", {status: 404})
  }
  
  return new Response("Endpoint not found", {status: 404})
}

Deno.serve({port: 3000}, handler)