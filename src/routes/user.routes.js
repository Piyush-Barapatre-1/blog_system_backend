const express = require("express");
const { getuser2, getuser, registerUser, loginUser, uploadblog, getuserblogs, getAllUnpublishBlogs, updatepublish, getAllPublishedBlogs, serachText, updateUser, refreshtoken } = require("../controllers/user.controller");
const dotenv = require("dotenv");
const connectdb = require("../database/connect.database");
const mongoose = require("mongoose")

const multer = require('multer');
const { hash } = require("bcrypt");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({ storage: storage });

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Returns User registered success message
 *       500:
 *          description: Returns internal server error
 */
router.post("/register", registerUser)

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login registered user
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: Password of the user
 *     responses:
 *       200:
 *         description: Returns login success message 
 */
router.post("/login", loginUser)

router.get("/getuser", getuser);

router.post("/postblog", upload.single('file'), uploadblog)

router.get("/getuserblogs", getuserblogs);

router.get("/getallunpublishblogs", getAllUnpublishBlogs);

router.put("/updatepublish/:id", updatepublish);

router.get("/getallpublishblogs", getAllPublishedBlogs);

router.get("/searchtext/:text", serachText);

router.put("/updateuser", updateUser);

router.post("/refreshtoken", refreshtoken)


module.exports = router;












// const app = require("../app")
// const getUser = require("../controllers/get_user.controller")
// const dotenv = require("dotenv")
// const connectdb = require("../database/connect.database")
// const mongoose = require("mongoose")
// dotenv.config()

// app.get("/getuser",  getUser)

// app.listen(process.env.port)