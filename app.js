const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');



//allow us to use .env variables
require('dotenv').config()

//import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');

//app server
const app = express();

//Database connection
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log("Database Connected"));

//middlewaress
app.use(morgan('dev'));
// app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(expressValidator());

//routes middlewares
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);

const port = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


