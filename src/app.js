const express = require("express");
const connectdb = require("./database/connect.database");
const cors = require("cors")
const path = require("path")
const helmet = require('helmet');

const swaggerJsDoc = require("swagger-jsdoc")
const swaggerUiExpress = require("swagger-ui-express")

const corsOptions = {
    origin: ['*'],/// Update to match your frontend's origin
    credentials: true,
};

const app = express();
const { User } = require('./models/user.model'); // Adjust the path as necessary
const userRoutes = require("./routes/user.routes")
const cookieParser = require("cookie-parser");
const { log } = require("console");
const myUploadFile = require("../my_file")
console.log("my file", myUploadFile);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.secretkey));
app.use(cors())
app.use('/uploads', express.static(myUploadFile));
app.use('/view', express.static('./view'));

app.use(helmet());
app.use(helmet.frameguard({
    action:'deny'
}))



// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API with Swagger',
        version: '1.0.0',
        description: 'A Blog System Application',
    },
    components: {
        schemas: {
            User, // Add the User schema here
        },
    }
};


// Options for swagger-jsdoc
const options = {
    swaggerDefinition,
    explorer: true,
    // Path to the API docs
    apis: ['./src/routes/*.js'],
};


// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsDoc(options);

// Custom CSS to hide the Schemas section
// const customCss = `
//   . {
//     display: none;
//   }
// `;
const swaggerUiOptions = {
    // customCss,
    swaggerOptions: {
        supportedSubmitMethods: [], // This disables the 'Try it out' button
    },
};

app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpec, swaggerUiOptions));


console.log(path.join(__dirname, 'uploads'));
module.exports = app;
