const exp = require("express");
const bp = require("body-parser");
const { success, error } = require("consola");
const { connect } = require("mongoose");
const passport = require('passport');
const mongoose = require("mongoose");

// Initialize the application
const app = exp();

// Bring in the app constants
const { DB, PORT } = require("./config");


var cors = require("cors");
app.use(cors({origin: true, credentials: true}));

// Middlewares
app.use(cors());
app.use(bp.json());
app.use(passport.initialize());

require('./middlewares/passport')(passport);



// User Router Middleware
app.use('/api/users', require("./routes/users"))



const startApp = async () => {
    try {
        // Connection with DB

        await connect(DB, {
            // useFindAndModify: true,
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        success({
            message: `Successfully connected with the Database \n${DB}`,
            badge: true
        })
        // Start listening for the server on PORT
        app.listen(PORT, () =>
            success({ message: `Server started on PORT ${PORT}`, badge: true })
        );
    } catch (err) {
        error({
            message: `Unable to connect with Database \n${err}`,
            badge: true
        });
        startApp()
    }
};

startApp();