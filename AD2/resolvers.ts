import { Collection } from "mongodb";
import { Flight, FlightModel } from "./types.ts";
import { fromModeltoFlight } from "./utils.ts";
import { ObjectId } from "mongodb";

export const resolvers = {
    Query: {
        getFlights: async (
            _: unknown,
            args: { origen?: string, destino?: string},
            context: { FlightsCollection: Collection<FlightModel> }
        ): Promise<Flight[]> => {

            if(args.origen && args.destino){
                const models = await context.FlightsCollection.find({ $and: [{origen: args.origen}, {destino: args.destino}] }).toArray()
                const flights = models.map((elem) => fromModeltoFlight(elem))

                return flights
            }

            const models = await context.FlightsCollection.find().toArray()
            const flights = models.map((elem) => fromModeltoFlight(elem))

            return flights
        },
        getFlight: async (
            _: unknown,
            args: {id: string},
            context: { FlightsCollection: Collection<FlightModel> }
        ): Promise<Flight | null> => {
            const model = await context.FlightsCollection.findOne({_id: new ObjectId(args.id)})

            if(!model){
                return null
            }

            const flight = fromModeltoFlight(model)
            return flight
        }
    },
    Mutation: {
        addFlight: async (
            _: unknown,
            args: { origen: string, destino: string, fechaYhora: string },
            context: { FlightsCollection: Collection<FlightModel> }
        ): Promise<Flight> => {
            const insertedFlight = await context.FlightsCollection.insertOne({
                origen: args.origen,
                destino: args.destino,
                fechaYhora: args.fechaYhora
            })

            const flight = fromModeltoFlight({
                _id: insertedFlight.insertedId,
                origen: args.origen,
                destino: args.destino,
                fechaYhora: args.fechaYhora
            })

            return flight
        }
    }
}