import { OptionalId } from "mongodb";

export type RestauranteModel = OptionalId<{
    nombre: string,
    direccion: string,
    ciudad: string,
    numTfno: string,
    temperatura: number,
    hora: string
}>