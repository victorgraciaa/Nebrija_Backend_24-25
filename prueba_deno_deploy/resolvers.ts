import { ObjectId, Collection } from "mongodb";
import { CommentModel, PostModel, UserModel } from "./types.ts";
import { GraphQLError } from "graphql";

const caracterRandom = ()  => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    return caracteres.charAt(Math.floor(Math.random()*caracteres.length))
}

type CreateUserInput = {
    name: string,
    password: string,
    email: string
}

type UpdateUserInput = {
    name: string,
    password: string
}

type CreatePostInput = {
    content: string,
    author: string
}

type UpdatePostInput = {
    content: string
}

type CreateCommentInput = {
    text: string,
    author: string,
    postId: string
}

type UpdateCommentInput = {
    text: string, 
}

export const resolvers = {
    User: {
        id: (parent: UserModel) => {
            return parent._id?.toString()
        },
        posts: async (parent: UserModel, _: unknown, ctx: { PostsCollection: Collection<PostModel> }) => {
            const ids = parent.posts
            return await ctx.PostsCollection.find({_id: {$in: ids}}).toArray()
        },
        comments: async (parent: UserModel, _: unknown, ctx: { CommentsCollection: Collection<CommentModel> }) => {
            const ids = parent.comments
            return await ctx.CommentsCollection.find({_id: {$in: ids}}).toArray()
        },
        likedPosts: async (parent: UserModel, _: unknown, ctx: { PostsCollection: Collection<PostModel> }) => {
            const ids = parent.likedPosts
            return await ctx.PostsCollection.find({_id: {$in: ids}}).toArray()
        }
    },

    Post: {
        id: (parent: PostModel) => {
            return parent._id?.toString()
        },
        author: async (parent: PostModel, _: unknown, ctx: { UsersCollection: Collection<UserModel> }) => {
            const id = parent.author
            return await ctx.UsersCollection.findOne({_id: id})
        },
        comments: async (parent: PostModel, _: unknown, ctx: { CommentsCollection: Collection<CommentModel> }) => {
            const ids = parent.comments
            return await ctx.CommentsCollection.find({_id: {$in: ids}}).toArray()
        },
        likes: async (parent: PostModel, _: unknown, ctx: { UsersCollection: Collection<UserModel> }) => {
            const ids = parent.likes
            return await ctx.UsersCollection.find({_id: {$in: ids}}).toArray()
        }
    },
    
    Comment: {
        id: (parent: CommentModel) => {
            return parent._id?.toString()
        },
        author: async (parent: CommentModel, _: unknown, ctx: { UsersCollection: Collection<UserModel> }) => {
            const id = parent.author
            return await ctx.UsersCollection.findOne({_id: id})
        },
        post: async (parent: CommentModel, _: unknown, ctx: { PostsCollection: Collection<PostModel> }) => {
            const id = parent.post
            return await ctx.PostsCollection.find({_id: id})
        }
    },

    Query: {
        users: async (_: unknown, __: unknown, ctx: { UsersCollection: Collection<UserModel> }) => {
            return await ctx.UsersCollection.find().toArray()
        },
        user: async (_: unknown, args: {id: string}, ctx: { UsersCollection: Collection<UserModel> }) => {
            const id = args.id
            return await ctx.UsersCollection.findOne({_id: new ObjectId(id)})
        },
        posts: async (_: unknown, __: unknown, ctx: { PostsCollection: Collection<PostModel> }) => {
            return await ctx.PostsCollection.find().toArray()
        },
        post: async (_: unknown, args: {id: string}, ctx: { PostsCollection: Collection<PostModel> }) => {
            const id = args.id
            return await ctx.PostsCollection.findOne({_id: new ObjectId(id)})
        },
        comments: async (_: unknown, __: unknown, ctx: { CommentsCollection: Collection<CommentModel> }) => {
            return await ctx.CommentsCollection.find().toArray()
        },
        comment: async (_: unknown, args: {id: string}, ctx: { CommentsCollection: Collection<CommentModel> }) => {
            const id = args.id
            return await ctx.CommentsCollection.findOne({_id: new ObjectId(id)})
        },
    },

    Mutation: {
        createUser: async (_: unknown, args: CreateUserInput, ctx: { UsersCollection: Collection<UserModel> }) => {
            
            if(await ctx.UsersCollection.findOne({email: args.email})){
                throw new GraphQLError("Usuario con ese email ya existente")
            }
            
            const { insertedId } = await ctx.UsersCollection.insertOne({
                name: args.name,
                password: args.password+caracterRandom(),
                email: args.email,
                posts: [],
                comments: [],
                likedPosts: []
            })

            return await ctx.UsersCollection.findOne({_id: insertedId})
        },
        updateUser: async (_: unknown, args: {id: string, input: UpdateUserInput}, ctx: { UsersCollection: Collection<UserModel> }) => {
            
            if(!await ctx.UsersCollection.findOne({_id: new ObjectId(args.id)})){
                throw new GraphQLError("Usuario no existente")
            }

            await ctx.UsersCollection.updateOne({_id: new ObjectId(args.id)}, {
                $set: {
                    name: args.name,
                    password: args.password+caracterRandom()
                }
            })

            return await ctx.UsersCollection.findOne({_id: new ObjectId(args.id)})
        },
        deleteUser: async (_: unknown, args: {id: string}, ctx: { UsersCollection: Collection<UserModel>, PostsCollection: Collection<PostModel>, CommentsCollection: Collection<CommentModel> }) => {

            if(!await ctx.UsersCollection.findOne({_id: new ObjectId(args.id)})){
                throw new GraphQLError("Usuario no existente")
            }

            const { deletedCount } = await ctx.UsersCollection.deleteOne({_id: new ObjectId(args.id)})
            if(deletedCount>0){

                await ctx.PostsCollection.deleteMany({author: new ObjectId(args.id)})
                await ctx.CommentsCollection.deleteMany({author: new ObjectId(args.id)})

                return true
            }
            else{
                return false
            }
        },
        createPost: async (_: unknown, args: CreatePostInput, ctx: { PostsCollection: Collection<PostModel>, UsersCollection: Collection<UserModel> }) => {
            
            if(!await ctx.UsersCollection.findOne({_id: new ObjectId(args.author)})){
                throw new GraphQLError("Usuario no existente")
            }
            
            const { insertedId } = await ctx.PostsCollection.insertOne({
                content: args.content,
                author: new ObjectId(args.author),
                comments: [],
                likes: []
            })

            await ctx.UsersCollection.updateOne({_id: new ObjectId(args.author)}, {
                $push: {
                    posts: insertedId
                }
            })

            return await ctx.PostsCollection.findOne({_id: insertedId})
        },
        updatePost: async (_: unknown, args: {id: string, input: UpdatePostInput}, ctx: { PostsCollection: Collection<PostModel> }) => {
            
            if(!await ctx.PostsCollection.findOne({_id: new ObjectId(args.id)})){
                throw new GraphQLError("Post no existente")
            }

            await ctx.PostsCollection.updateOne({_id: new ObjectId(args.id)}, {
                $set: {
                    content: args.content
                }
            })

            return await ctx.PostsCollection.findOne({_id: new ObjectId(args.id)})
        },
        deletePost: async (_: unknown, args: {id: string}, ctx: { PostsCollection: Collection<PostModel>, UsersCollection: Collection<UserModel>, CommentsCollection: Collection<CommentModel> }) => {

            const deletedPost = await ctx.PostsCollection.findOne({_id: new ObjectId(args.id)})
            
            if(!deletedPost){
                throw new GraphQLError("Post no existente")
            }

            const { deletedCount } = await ctx.PostsCollection.deleteOne({_id: new ObjectId(args.id)})
            if(deletedCount>0){

                await ctx.UsersCollection.updateOne({_id: deletedPost.author}, {
                    $pull: {
                        posts: new ObjectId(args.id)
                    }
                })

                await ctx.CommentsCollection.deleteMany({post: new ObjectId(args.id)})
                
                return true
            }
            else{
                return false
            }
        },
        addLikeToPost: async (_: unknown, args: {postId: string, userId: string}, ctx: { PostsCollection: Collection<PostModel>, UsersCollection: Collection<UserModel> }) => {
            
            if(!await ctx.PostsCollection.findOne({_id: new ObjectId(args.postId)}) || !await ctx.UsersCollection.findOne({_id: new ObjectId(args.userId)}) ){
                throw new GraphQLError("Post o usuario no existente")
            }

            if(await ctx.UsersCollection.findOne({likedPosts: new ObjectId(args.postId)})){
                throw new GraphQLError("Post ya likeado por el usuario")
            }
            
            const { matchedCount } = await ctx.PostsCollection.updateOne({_id: new ObjectId(args.postId)}, {
                $push: {
                    likes: new ObjectId(args.userId)
                }
            })

            if(matchedCount>0){
                await ctx.UsersCollection.updateOne({_id: new ObjectId(args.userId)}, {
                    $push: {
                        likedPosts: new ObjectId(args.postId)
                    }
                })
            }
            
            return await ctx.PostsCollection.findOne({_id: new ObjectId(args.postId)})
        },
        removeLikeFromPost: async (_: unknown, args: {postId: string, userId: string}, ctx: { PostsCollection: Collection<PostModel>, UsersCollection: Collection<UserModel> }) => {
            
            if(!await ctx.PostsCollection.findOne({_id: new ObjectId(args.postId)}) || !await ctx.UsersCollection.findOne({_id: new ObjectId(args.userId)}) ){
                throw new GraphQLError("Post o usuario no existente")
            }
            
            const { matchedCount } = await ctx.PostsCollection.updateOne({_id: new ObjectId(args.postId)}, {
                $pull: {
                    likes: new ObjectId(args.userId)
                }
            })

            if(matchedCount>0){
                await ctx.UsersCollection.updateOne({_id: new ObjectId(args.userId)}, {
                    $pull: {
                        likedPosts: new ObjectId(args.postId)
                    }
                })
            }  

            return await ctx.PostsCollection.findOne({_id: new ObjectId(args.postId)})
        },
        createComment: async (_: unknown, args: CreateCommentInput, ctx: { CommentsCollection: Collection<CommentModel>, UsersCollection: Collection<UserModel>, PostsCollection: Collection<PostModel> }) => {
            
            if(!await ctx.PostsCollection.findOne({_id: new ObjectId(args.postId)}) || !await ctx.UsersCollection.findOne({_id: new ObjectId(args.author)}) ){
                throw new GraphQLError("Post o usuario no existente")
            }

            const { insertedId } = await ctx.CommentsCollection.insertOne({
                text: args.text,
                author: new ObjectId(args.author),
                post: new ObjectId(args.postId)
            })

            await ctx.UsersCollection.updateOne({_id: new ObjectId(args.author)}, {
                $push: {
                    comments: insertedId
                }
            })

            await ctx.PostsCollection.updateOne({_id: new ObjectId(args.postId)}, {
                $push: {
                    comments: insertedId
                }
            })

            return await ctx.CommentsCollection.findOne({_id: insertedId})
        },
        updateComment: async (_: unknown, args: {id: string, input: UpdateCommentInput}, ctx: { CommentsCollection: Collection<CommentModel> }) => {
            
            if(!await ctx.CommentsCollection.findOne({_id: new ObjectId(args.id)})){
                throw new GraphQLError("Comentario no existente")
            }

            await ctx.CommentsCollection.updateOne({_id: new ObjectId(args.id)}, {
                $set: {
                    text: args.text
                }
            })

            return await ctx.CommentsCollection.findOne({_id: new ObjectId(args.id)})
        },
        deleteComment: async (_: unknown, args: {id: string}, ctx: { CommentsCollection: Collection<CommentModel>, UsersCollection: Collection<UserModel>, PostsCollection: Collection<PostModel> }) => {
            
            const deletedComment = await ctx.CommentsCollection.findOne({_id: new ObjectId(args.id)})

            if(!deletedComment){
                throw new GraphQLError("Comentario no existente")
            }

            const { deletedCount } = await ctx.CommentsCollection.deleteOne({_id: new ObjectId(args.id)})
            if(deletedCount>0){

                
                await ctx.UsersCollection.updateOne({_id: deletedComment.author}, {
                    $pull: {
                        comments: new ObjectId(args.id)
                    }
                })
                
                await ctx.PostsCollection.updateOne({_id: deletedComment.post}, {
                    $set: {
                        comments: new ObjectId(args.id)
                    }
                })

                return true
            }
            else{
                return false
            }
        }

    }
}