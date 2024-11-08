import { Collection, ObjectId } from "mongodb";
import { Persona, PersonaModel } from "./types.ts";

export const modelToPersona = async (persona: PersonaModel, personas: Collection): Promise<Response> => {
    
    const pers =  {
        id: persona?._id.toString(),
        nombre: persona.nombre,
        email: persona.email,
        telefono: persona.telefono,
        amigos: await persona.amigos.map(async (a) => {
            personas.findOne({_id: a})
        })
    }

    return new Response(JSON.stringify(pers), {status: 200})
}