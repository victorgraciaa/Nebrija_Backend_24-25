import { Collection, ObjectId } from "mongodb";
import { TaskModel } from "./types.ts";

export const checkTaskExist = async (idTask: ObjectId, tasks: Collection<TaskModel>) => {
    const task = await tasks.findOne({_id: new ObjectId(idTask)})
    if(!task){
        return new Response("Tarea no encontrada", {status: 404})
    }
    
    return true
}