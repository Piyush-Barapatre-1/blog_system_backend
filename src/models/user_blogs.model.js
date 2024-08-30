const mongoose = require("mongoose")

const blogsSchema = new mongoose.Schema(
    {
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "blog_user"
        },

        blog_title: {
            type: String,
            required: true
        },

        blog_description: {
            type: String,
            required: true
        },

        blog_img: {
            type: String,
            required: true
        },

        blog_status: {
            type: String,
            default: "unpublish"
        },

        blog_tags: {
            type: String,
            required: true

        }
    },
    { timestamps: true }
)

blogsSchema.index({ blog_tags: "text", blog_title: "text" })

const UserBlogs = mongoose.model("user_blogs", blogsSchema)
module.exports = UserBlogs