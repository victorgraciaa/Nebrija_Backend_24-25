import { Flight, FlightModel } from "./types.ts";

export const fromModeltoFlight = (model: FlightModel): Flight => {
    return {
        id: model._id!.toString(),
        origen: model.origen,
        destino: model.destino,
        fechaYhora: model.fechaYhora
    }
}