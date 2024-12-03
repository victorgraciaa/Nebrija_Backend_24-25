import { ObjectId, OptionalId } from "mongodb";

export type User = {
    id: string,
    name: string,
    email: string,
    created_at: Date
}

export type UserModel = OptionalId<{
    name: string,
    email: string,
    created_at: Date
}>

export type Project = {
    id: string,
    name: string,
    description?: string,
    start_date: Date,
    end_date?: Date | null,
    user_id: string
}

export type ProjectModel = OptionalId<{
    name: string,
    description?: string,
    start_date: Date,
    end_date?: Date | null,
    user_id: ObjectId
}>

export enum status {
    pending = "pending",
    in_progress = "in_progress",
    completed = "completed"
}

export type Task = {
    id: string,
    title: string,
    description?: string,
    status: status,
    created_at: Date,
    due_date?: Date,
    project_id: string
}

export type TaskModel = OptionalId<{
    title: string,
    description?: string,
    status: status,
    created_at: Date,
    due_date?: Date,
    project_id: ObjectId
}>