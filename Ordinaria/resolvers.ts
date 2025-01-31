import { Collection } from "mongodb";
import { RestauranteModel } from "./types.ts";
import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";

type PhoneAPI = {
    is_valid: boolean,
    timezones: string[],
}

type WeatherAPI = {
    temp: number
}

type TimeAPI = {
    hour: string,
    minute: string
}

type CityAPI = {
    latitude: string,
    longitude: string
}

const API_KEY = Deno.env.get("API_KEY")
if(!API_KEY){
    throw new Error("API_KEY not found")
}

export const resolvers = {
    Restaurante: {
        id: (parent: RestauranteModel) => {
            return parent._id!.toString()
        },

        
        temperatura: async (parent: RestauranteModel) => {
            const responseCity = await fetch(`https://api.api-ninjas.com/v1/city?name=${parent.ciudad}`, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            })

            if(responseCity.status !== 200){
                throw new GraphQLError("API Error")
            }

            const dataCity = await responseCity.json()
            const lat = dataCity[0].latitude
            const lon = dataCity[0].longitude
            
            const responseTemp = await fetch(`https://api.api-ninjas.com/v1/weather?lat=${lat}&lon=${lon}`, {
                
                headers: {
                    "X-Api-Key": API_KEY
                }
            })

            if(responseTemp.status !== 200){
                console.log(dataCity)
                throw new GraphQLError("API Error")
            }

            const dataTemp: WeatherAPI = await responseTemp.json()

            return dataTemp.temp
        },

        hora: async (parent: RestauranteModel) => {

            const responseCity = await fetch(`https://api.api-ninjas.com/v1/city?name=${parent.ciudad}`, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            })

            if(responseCity.status !== 200){
                throw new GraphQLError("API Error")
            }

            const dataCity = await responseCity.json()
            const lat = dataCity[0].latitude
            const lon = dataCity[0].longitude

            const responseHora = await fetch(`https://api.api-ninjas.com/v1/worldtime?lat=${lat}&lon=${lon}}`, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            })

            if(responseHora.status !== 200){
                throw new GraphQLError("API Error")
            }
            
            const dataHora: TimeAPI = await responseHora.json()

            return dataHora.hour+":"+dataHora.minute
        }
        
    },

    Query: {
        getRestaurant: async (_: unknown, args: {id: string}, ctx: {RestaurantesCollection: Collection<RestauranteModel>}) => {
            if(!args.id){
                throw new GraphQLError("Se debe proporcionar un ID")
            }

            const res = await ctx.RestaurantesCollection.findOne({_id: new ObjectId(args.id)})

            if(!res){
                throw new GraphQLError("Restaurante no encontrado")
            }

            return res
        },

        getRestaurants: async (_: unknown, args: {ciudad: string}, ctx: {RestaurantesCollection: Collection<RestauranteModel>}) => {
            
            if(!args.ciudad){
                throw new GraphQLError("Se debe proporcionar la ciudad")
            }
            
            const restaurantes = await ctx.RestaurantesCollection.find({ciudad: args.ciudad}).toArray()

            return restaurantes
        }
    },

    Mutation: {
        addRestaurant: async (_: unknown, args: {nombre: string, direccion: string, ciudad: string, numTfno: string},
            ctx: {RestaurantesCollection: Collection<RestauranteModel>}
        ) => {

            //numTfno
            const responsePhone = await fetch(`https://api.api-ninjas.com/v1/validatephone?number=${args.numTfno}`, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            })

            if(responsePhone.status !== 200){
                throw new GraphQLError("API Error")
            }

            const dataPhone: PhoneAPI = await responsePhone.json()

            if(!dataPhone.is_valid){
                throw new GraphQLError("Número de teléfono no válido")
            }

            const check = await ctx.RestaurantesCollection.findOne({numTfno: args.numTfno})
            if(check){
                throw new Error("Restaurante ya existente con ese número de teléfono")
            }

            //latitud y longitud
            const responseCity = await fetch(`https://api.api-ninjas.com/v1/city?name=${args.ciudad}`, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            })

            if(responseCity.status !== 200){
                throw new GraphQLError("API Error")
            }

            const dataCity = await responseCity.json()
            const lat = dataCity[0].latitude
            const lon = dataCity[0].longitude

            //temp
            
            const responseTemp = await fetch(`https://api.api-ninjas.com/v1/weather?lat=${lat}&lon=${lon}`, {
                
                headers: {
                    "X-Api-Key": API_KEY
                }
            })

            if(responseTemp.status !== 200){
                console.log(dataCity)
                throw new GraphQLError("API Error")
            }

            const dataTemp: WeatherAPI = await responseTemp.json()

            //hora
            const responseHora = await fetch(`https://api.api-ninjas.com/v1/worldtime?lat=${lat}&lon=${lon}`, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            })

            if(responseHora.status !== 200){
                throw new GraphQLError("API Error")
            }
            
            const dataHora: TimeAPI = await responseHora.json()

            const { insertedId } = await ctx.RestaurantesCollection.insertOne({
                nombre: args.nombre,
                direccion: args.direccion,
                ciudad: args.ciudad,
                numTfno: args.numTfno,
                temperatura: dataTemp.temp,
                hora: dataHora.hour+":"+dataHora.minute
            })

            return await ctx.RestaurantesCollection.findOne({_id: insertedId})
            
        },

        deleteRestaurant: async (_: unknown, args: {id: string}, ctx: {RestaurantesCollection: Collection<RestauranteModel>}) => {
            const { deletedCount } = await ctx.RestaurantesCollection.deleteOne({_id: new ObjectId(args.id)})
            
            if(deletedCount<=0){
                return false
            }
            else{
                return true
            }
            
        }
    }
}