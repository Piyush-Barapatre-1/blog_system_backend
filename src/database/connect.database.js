const mongoose = require("mongoose");
const db_name = require("C:/Piyush/practice/blog_system_backend/constants.js");
const Grid = require('gridfs-stream');
const dotenv = require("dotenv");

const BlogUser = require("../models/blog_user.model")
const UserBlogs = require("../models/user_blogs.model")

dotenv.config();

console.log(db_name);
module.exports = (async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.mongodb_uri}/${db_name}`
        );

        console.log(
            `mongo db connected DB Host ${connectionInstance.connection.port}`
        );

    } catch (error) {
        console.error("Error", error);
        process.exit(1);
    }
})();




// Create a new user
// const newUser = new BlogUser({
//     full_name: "John Doe",
//     username: "john_doe",
//     password: "secure_password",
// });

// const savedUser = await newUser.save();

// // Create a new blog associated with the new user
// const newBlog = new UserBlogs({
//     created_by: savedUser._id,
//     blog_title: "My First Blog",
//     blog_description: "This is the description of my first blog.",
//     blog_img: "image_url_or_base64_string",
// });

// const savedBlog = await newBlog.save();

// // Update the user's user_blogs array to include the new blog
// savedUser.user_blogs.push(savedBlog._id);
// await savedUser.save();

// console.log("Example user and blog created successfully!");
