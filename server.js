// modules
const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// environment variables
const secretKey = process.env.RECAPTCHA_SECRET;
const port = process.env.PORT || 4000;

// headers
app.use(
    bodyParser.urlencoded({
        extended: false,
    }),
);

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept",
    );
    next();
});

// root
app.get("/", (req, res) => {
    res.sendStatus(200);
});

// process recaptcha
app.post("/", async (req, res) => {
    if (
        req.body.captcha === undefined ||
        req.body.captcha === "" ||
        req.body.captcha === null
    ) {
        return res.json({
            success: false,
            msg: "reCAPTCHA not defined",
        });
    }

    try {
        // verification url
        const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.socket.remoteAddress}`;

        // make request
        const response = await axios.get(verifyUrl);
        const data = response.data;

        // failure
        if (data.success !== undefined && !data.success) {
            return res.json({
                success: false,
                msg: "reCAPTCHA failed",
            });
        }

        // success
        return res.json({
            success: true,
            msg: "reCAPTCHA verified",
        });
    } catch (error) {
        return res.json({
            success: false,
            msg: "Error verifying reCAPTCHA",
        });
    }
});

// listen for connections
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
