import { ObjectId, OptionalId } from "mongodb"

export type Flight = {
    id: string,
    origen: string,
    destino: string,
    fechaYhora: string,
}

export type FlightModel = OptionalId<{
    _id: ObjectId,
    origen: string,
    destino: string,
    fechaYhora: string,
}>