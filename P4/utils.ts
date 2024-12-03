import { Project, ProjectModel, Task, TaskModel, User, UserModel } from "./types.ts";

export const fromModelToUser = (model: UserModel): User => {
    return {
        id: model._id!.toString(),
        name: model.name,
        email: model.email,
        created_at: model.created_at
    }
}

export const fromModelToProject = (model: ProjectModel): Project => {
    return {
        id: model._id!.toString(),
        name: model.name,
        description: model.description,
        start_date: model.start_date,
        end_date: null,
        user_id: model.user_id.toString()
    }
}

export const fromModelToTask = (model: TaskModel): Task => {
    return {
        id: model._id!.toString(),
        title: model.title,
        description: model.description,
        status: model.status,
        created_at: model.created_at,
        due_date: model.due_date,
        project_id: model.project_id.toString()
    }
}