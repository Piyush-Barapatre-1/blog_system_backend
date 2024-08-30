const UserBlogs = require("../models/user_blogs.model")
const BlogUser = require("../models/blog_user.model")
const connectdb = require("../database/connect.database")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

var fs = require('fs');
var path = require('path');
const { log, error } = require("console")



const registerUser = async (req, res) => {

    try {
        const user = req.body;

        // Validate the user input
        if (!user || !user.full_name || !user.username || !user.password) {
            return res.status(400).send({ message: "All fields are required." });
        }

        // Check if the username already exists
        const existingUser = await BlogUser.findOne({ username: user.username });
        if (existingUser) {
            return res.status(400).send({ message: "Username already exists enter different username" });
        }

        // Create and save the new user
        const newUser = new BlogUser(user);
        const result = await newUser.save();


        // 
        // Respond with the created user (excluding password)
        const userResponse = { ...result._doc };
        delete userResponse.password;

        res.status(201).send({ message: "Registration Successful" });

    } catch (error) {
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
}

// const loginUser = async (req, res) => {

//     try {

//         const user = req.body

//         const result = await BlogUser.findOne({ username: user.username });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const match = await bcrypt.compare(user.password, result.password);

//         if (!match) {

//             return res.status(401).json({ message: 'Invalid credentials' });

//         }

//         const token = jwt.sign({ userId: result._id }, process.env.secretkey, { expiresIn: "15m" })

//         const refreshtoken = jwt.sign({userId: result._id}, process.env.refresh_token_secret_key, {expiresIn: "2d"})

//         res.cookie("authtoken", token, {
//             httpOnly: true,
//             secure: false,
//             signed: true,
//             maxAge: 2 * 60 * 60 * 1000  //2h
//         })

//         if (match) {
//             res.status(200).send({token: token, message: 'Login successful', usertype: result.usertype });
//         }
//     }
//     catch (error) {

//         res.status(500).send({ message: "Invalid Credentials", error: error.message })
//     }
// }

const loginUser = async (req, res) => {

    try {

        const user = req.body

        const result = await BlogUser.findOne({ username: user.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const match = await bcrypt.compare(user.password, result.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const authtoken = jwt.sign({ userId: result._id }, process.env.secretkey, { expiresIn: "15m" })

        const refreshtoken = jwt.sign({ userId: result._id }, process.env.refresh_token_secret_key, { expiresIn: "2d" })

        await BlogUser.updateOne({ _id: result._id }, { $set: { refresh_token: refreshtoken } })

        res.cookie("authtoken", authtoken, {
            httpOnly: true,
            secure: false,
            signed: true,
            maxAge: 2 * 24 * 60 * 60 * 1000  //2h    
        })

        BlogUser.updateOne({ _id: result._id }, { $set: { refresh_token: refreshtoken } })

        res.status(200).send({ refresh_token: refreshtoken, usertype: result.usertype });

    } catch (error) {

        res.status(500).json({ message: "Invalid Credentials", error: error.message })
    }

}

const getuser = async (req, res) => {
    try {
        const token = req.signedCookies.authtoken;

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        jwt.verify(token, process.env.secretkey, async (error, authData) => {
            if (error) {
                return res.status(403).json({ message: 'Invalid token.' });
            }

            try {
                const userId = authData.userId;
                const user = await BlogUser.findById(userId);

                if (!user) {
                    return res.status(404).json({ message: 'User not found.' });
                }

                const userObject = user.toObject();
                // delete userObject.password; // Remove sensitive information
                res.status(200).json(userObject);

            } catch (err) {
                res.status(500).json({ message: 'Error fetching user data.', error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};


const uploadblog = async (req, res) => {
    try {
        const token = req.signedCookies.authtoken;

        jwt.verify(token, process.env.secretkey, async (error, authData) => {
            if (error) {
                return res.status(401).send("Invalid token");
            }

            try {
                const userId = authData.userId;
                let user = await BlogUser.findById(userId);
                if (!user) {
                    return res.status(404).send("User not found");
                }

                let newBlog = new UserBlogs({
                    created_by: user._id,
                    blog_title: req.body.blog_title,
                    blog_description: req.body.blog_description,
                    blog_tags: req.body.blog_tags,
                    blog_img: `/uploads/${req.file.filename}`
                });

                const savedblog = await newBlog.save();

                // Update the user's user_blogs array to include the new blog
                user.user_blogs.push(savedblog._id);
                await user.save();

                res.status(200).send({ message: "Your blog Registered Successfully" });
            } catch (saveError) {
                console.error("Error saving blog:", saveError);
                res.status(500).send({ message: "Something went wrong while saving the blog!" });
            }
        });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send({ message: "Something went wrong!" });
    }
};

const getuserblogs = (req, res) => {

    console.log("Method Called");

    try {
        const token = req.signedCookies.authtoken;

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        jwt.verify(token, process.env.secretkey, async (error, authData) => {
            if (error) {
                return res.status(403).json({ message: 'Invalid token.' });
            }

            try {
                const userId = authData.userId;
                const user_blogs = await UserBlogs.find({ created_by: userId });

                if (!user_blogs) {
                    return res.status(404).json({ message: 'User not found.' });
                }
                console.log(user_blogs);

                res.status(200).send(user_blogs);
            } catch (err) {
                res.status(500).json({ message: 'Error fetching blogs data.', error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
}

const getAllUnpublishBlogs = async (req, res) => {
    try {

        let result = await UserBlogs.aggregate([
            {
                $match: { blog_status: "unpublish" }
            },
            {
                $lookup: {
                    from: "blog_users", // The collection name in MongoDB
                    localField: "created_by",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user" // Deconstructs the user array field to output a document for each element
            }
        ]);

        // console.log("method");
        // let result = await UserBlogs.find({ blog_status: "unpublished" });
        // console.log(result);


        if (!result) {
            res.status(400).json({
                success: false,
                message: "Failed to get the result"
            })
        }

        res.status(200).json({
            success: true,
            result: result
        })

    } catch (error) {

        res.status(500).json({ message: 'An error occurred while fetching unpublished blogs.', error: error.message });
    }
};

const updatepublish = async (req, resp) => {
    try {
        let blog_id = req.params.id
        console.log(blog_id);
        let result = await UserBlogs.findById(blog_id)

        if (!result) {
            resp.status(500).send({ message: "No blog found" })
        }

        result.blog_status = "publish"
        let updated_blog = await result.save()

        if (!updated_blog) {
            resp.status(500).send({ message: "Blog Not Published" })
        }

        console.log(updated_blog);

        resp.status(200).send({ message: "Blog Status Updated Successfully" })

    } catch (error) {

        resp.status(500).send({ message: error.message })

    }
}

const getAllPublishedBlogs = async (req, res) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;

        let result = await UserBlogs.aggregate([
            {
                $match: { blog_status: "publish" }
            },

            {
                $lookup: {
                    from: "blog_users",
                    localField: "created_by",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $sort: { updatedAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);

        if (!result) {
            res.status(400).json({
                success: false,
                message: "Failed to get the result"
            })
        }

        res.status(200).json({
            success: true,
            result: result
        })

    } catch (error) {

        res.status(500).json({ message: 'An error occurred while fetching unpublished blogs.', error: error.message });
    }

}

const serachText = async (req, resp) => {
    try {

        let text = req.params.text

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;

        const searchText = req.params.text;
        const regex = new RegExp(searchText, 'i'); // 'i' makes the search case-insensitive

        let textResult = await UserBlogs.aggregate([
            {
                $match: {
                    $text: { $search: text },
                    blog_status: 'publish'
                }

            },
            {
                $lookup: {
                    from: "blog_users", // The collection name in MongoDB
                    localField: "created_by",
                    foreignField: "_id",
                    as: "user"
                }
            },

            {
                $sort: { updatedAt: -1 } // Sort by timestamp in descending order
            },
            {
                $skip: skip // Skip the appropriate number of documents
            },
            {
                $limit: limit // Limit the number of documents returned
            }
        ]);

        // const textResult = result.toObject()
        // delete textResult.created_by

        console.log(textResult);
        if (!textResult) {
            resp.status(500).json(
                {
                    success: false
                }
            )
        }

        resp.status(200).json(
            {
                success: true,
                result: textResult
            }
        )

    } catch (error) {

        resp.status(500).json("No text found")

    }
}

const updateUser = async (req, resp) => {

    try {
        token = req.signedCookies.authtoken

        jwt.verify(token, process.env.secretkey, async (error, authdata) => {
            const userId = authdata.userId

            let result = await BlogUser.updateOne({ _id: userId }, { $set: req.body })

            console.log(result);
        })
    } catch (error) {

        console.log(error);

    }

}

const refreshtoken = (req, resp) => {

}


module.exports = { getuser, registerUser, loginUser, uploadblog, getuserblogs, getAllUnpublishBlogs, updatepublish, getAllPublishedBlogs, serachText, updateUser, refreshtoken }