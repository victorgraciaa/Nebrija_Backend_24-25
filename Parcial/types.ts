import { ObjectId } from "mongodb";

export type Persona = {
    id: string,
    nombre: string,
    email: string,
    telefono: number,
    amigos: Persona[]
}

export type PersonaModel = {
    _id: ObjectId,
    nombre: string,
    email: string,
    telefono: number,
    amigos: ObjectId[]
}
