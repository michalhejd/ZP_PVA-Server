"use strict";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import User from "../models/User.js"
import { vokativ } from "vokativ";
config();

const app = express.Router()

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  if (!(email && password)) {
    res.status(422).send("All input is required");
    return;
  }

  try {
    email = email.toString();
  }
  catch (err) {
    res.status(400).send("Wrong email format");
    return;
  }


  let user = await User.findOne({ email }).catch(err => {
    console.log(err);
  });

  if (user && (await bcrypt.compare(password, user.password))) {

    let token = jwt.sign({ email },
      "supersecret",
      {
        expiresIn: "10s",
      }
    );

    let response = {
      token: token,
    }
    res.status(200).json(response);
  }
  else {
    res.status(401).send("Invalid Credentials");
    return;
  }
});

app.get("/user/data", verifyToken, async (req, res) => {
  console.log(req.token)
  console.log(typeof req.token)
  await jwt.verify(req.token, "supersecret", async (err, data) => {
    if (err) {
      res.status(403).send("Forbidden");
      return
    }
    else {
      let user = await User.findOne({ email: data.email }).catch(err => {
        console.log(err);
      }
      );
      let username = user.name.split(" ");
      username[0] = vokativ(username[0]);
      username[1] = vokativ(username[1]);
      username[0] = username[0].charAt(0).toUpperCase() + username[0].slice(1);
      username[1] = username[1].charAt(0).toUpperCase() + username[1].slice(1);
      let response = {
        name: user.name,
        email: user.email,
        vokativ: username[0] + " " + username[1],
        grades: user.grades
      }
      console.log(username[0] + " " + username[1]);

      res.status(200).json(response);
    }
  }
  )
}
);
app.post("/grade/new", verifyToken, async (req, res) => {
  await jwt.verify(req.token, "supersecret", async (err, data) => {
    if (err) {
      res.status(403).send("Forbidden");
      return;
    }
    else {
      let { grade, subject } = req.body;
      if (!(grade && subject )) {
        res.status(422).send("All input is required");
        return;
      }
      let user = await User.findOne({ email: data.email }).catch(err => {
        console.log(err);
      }
      );
      let date = new Date();
      date = date.toJSON();
      user.grades.push({
        grade: grade,
        subject: subject,
        date: date
      });
      await user.save().catch(err => {
        console.log(err);
      }
      );
      res.status(200).send("Grade added");
    }
  }
  )
}
);
app.post("/user/new", async (req, res) => {
  let { name, email, password } = req.body;
  if (!(name && email && password)) {
    res.status(422).send("All input is required");
    return;
  }
  try {
    email = email.toString();
  }
  catch (err) {
    res.status(400).send("Wrong email format");
    return;
  }
  let user = await User.findOne({ email }).catch(err => {
    console.log(err);
  }
  );
  if (user) {
    res.status(409).send("User already exists");
    return;
  }
  else {
    let hash = await bcrypt.hash(password, 10).catch(err => {
      console.log(err);
    }
    );
    let newUser = new User({
      name: name,
      email: email,
      password: hash,
      grades: []
    });
    await newUser.save().catch(err => {
      console.log(err);
    }
    );
    res.status(200).send("User created");
  }
}
);

      function verifyToken(req, res, next) {
        const bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== "undefined") {
          const bearer = bearerHeader.split(" ");
          const bearerToken = bearer[1];
          req.token = bearerToken;
          next();
        } else {
          res.status(401).send("Not logged in");
        }
      }
      export default app;