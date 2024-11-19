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
<<<<<<< HEAD
}
=======
}
>>>>>>> 303a6c83e90c1c8e13ee379bd26c7ca5df9733ba
