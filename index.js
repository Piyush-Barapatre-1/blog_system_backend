const app = require("./src/app");
// const connectdb = require("./src/database/connect.database");
const userRoutes = require("./src/routes/user.routes");
const dotenv = require("dotenv");

dotenv.config();

app.use(userRoutes);

const PORT = process.env.port || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
