import express from 'express';
import cors from 'cors';
import morgan from "morgan";
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from "./swagger.json";
import Cryptr from 'cryptr';
import { getUserList, findUserById } from "./user";
import TinyJsDb from 'tiny-js-db';
import rateLimit from 'express-rate-limit';

const app = express();
const options = {
    explorer: true
};
const userList = getUserList(); // assume for now this is your database
dotenv.config();
const cryptr = new Cryptr(`${process.env.SECRET}`)

// app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(morgan('combined'));

app.listen(process.env.PORT, async() => {
    console.log(`server listening on port ${process.env.PORT}!`);
});

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this IP"
});

app.use(limiter);

//OAuth

const authCodes = new Set();
const accessTokens = new Set();

app.get('/code', (req, res) => {
    const { auth } = req.query;

    const authCode = cryptr.encrypt(auth)

    authCodes.add(auth);

    res.status(200).json({ code: `${authCode}` });
});

// Verify an auth code and exchange it for an access token
app.get('/token', cors(), (req, res) => {
    const decrypt = cryptr.decrypt(req.query.code);
    if (authCodes.has(`${decrypt}`)) {
        // Generate a string of 50 random digits
        const token = new Array(50).fill(null).map(() => Math.floor(Math.random() * 10)).join('');
        authCodes.delete(req.query.code);
        accessTokens.add(token);
        res.status(200).json({ 'access_token': token, 'expires_in': 60 * 60 * 24 });
    } else {
        res.status(400).json({ message: 'Invalid auth token' });
    }
});

if (process.env.NODE_ENV == "DEV") {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
}

// Endpoint secured by auth token
if (process.env.NODE_ENV == "DEV") {
    app.use((req, res) => {
        const authorization = req.get('authorization');
        if (!accessTokens.has(authorization)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        next();
    });
}





// GET Call for all users
app.get("/users", (req, res) => {
    return res.status(200).send({
        success: "true",
        message: "users",
        users: userList,
    });
});

app.get("/", (req, res) => {
    return res.status(200).send({
        success: "true",
        message: "users",
        users: userList,
    });
});

//  POST call - Means you are adding new user into database 

app.post("/user", (req, res) => {

    if (!req.body.name) {
        return res.status(400).send({
            success: "false",
            message: "name is required",
        });
    } else if (!req.body.age) {
        return res.status(400).send({
            success: "false",
            message: "age is required",
        });
    } else if (!req.body.id_card) {
        return res.status(400).send({
            success: "false",
            message: "id card is required",
        });
    }
    const user = {
        id: userList.length + 1,
        name: req.body.name,
        age: req.body.companies,
        id_card: cryptr.encrypt(`${id_card}`),
        risk_level: req.body.risk_level
    };
    userList.push(user);
    return res.status(201).send({
        success: "true",
        message: "user added successfully",
        user,
    });
});

app.put("/user/:userId", (req, res) => {
    console.log(req.params)
    const id = parseInt(req.params.userId, 10);
    const userFound = findUserById(id)


    if (!userFound) {
        return res.status(404).send({
            success: 'false',
            message: 'user not found',
        });
    }

    const updatedUser = {
        id: id,
        name: req.body.name || userFound.body.name,
        age: req.body.age || userFound.body.age,
        risk_level: req.body.risk_level || userFound.body.risk_level

    };

    for (let i = 0; i < userList.length; i++) {
        if (userList[i].id === id) {
            userList[i] = updatedUser;
            return res.status(201).send({
                success: 'true',
                message: 'user updated successfully',
                updatedUser

            });
        }
    }
    return res.status(404).send({
        success: 'true',
        message: 'error in update'

    });
})

app.delete("/user/:userId", (req, res) => {
    // SIMULATE RETURN STATUS 
    return res.status(405).send("Delete Data not allow")
})





export { app };