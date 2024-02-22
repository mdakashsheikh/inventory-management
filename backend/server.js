require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const errorHandler = require('./middleWare/errorMiddleWare')

const app = express();

/* -------------------------------- */
/*            Middlewares           */
/* -------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());


/* -------------------------------- */
/*        Routes Middlewares        */
/* -------------------------------- */
app.use('/api/users', userRoute);


/* -------------------------------- */
/*         Error Middlewares        */
/* -------------------------------- */
app.use(errorHandler);


/* -------------------------------- */
/*      Connected to Database       */
/* -------------------------------- */
const PORT = process.env.PORT || 5900
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {

        app.listen(PORT, () => {
            console.log(`Server listening on PORT ${PORT}`);
        })

    })
    .catch(err => console.log(err));