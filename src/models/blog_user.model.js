const mongoose = require("mongoose");
const bcrypt = require("bcrypt")

const BlogUserSchema = new mongoose.Schema({
    full_name: {
        required: true,
        type: String,
    },

    username: {
        required: true,
        type: String,
    },

    password: {
        required: true,
        type: String
    },

    usertype: {
        required: true,
        type: String
    },
    
    refresh_token: {

        type: String,
        // required: true
    },

    user_blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user_blogs"
        }
    ]
});

BlogUserSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password') || this.isNew) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

const BlogUser = mongoose.model("blog_user", BlogUserSchema)
module.exports = BlogUser
