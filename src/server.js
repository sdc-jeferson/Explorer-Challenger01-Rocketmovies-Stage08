require("express-async-errors");
const AppError = require("./utils/AppError");
const express = require("express");
const routes = require("./routes");
const connection = require("./database/knex")

const app = express();

app.use(express.json());
app.use(routes);
app.database = connection;

app.use((error, request, response, next) => {
    
    if (error instanceof AppError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message, 
        })
    }

    console.error(error)
 
    return response.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
}

) 

const PORT = 3002;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})  