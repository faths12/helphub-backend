const express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
const { auth } = require("./firebase.js");
const exp = express();
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} = require("firebase/auth");
const { admin, db, get_data } = require("./firestore.js");
const cookieParser = require("cookie-parser");
const { stringify } = require("querystring");
const { create } = require("domain");
const { update } = require("firebase/database");
const port = 3000;

exp.set("view engine", "ejs");
exp.use(bodyParser.urlencoded({ extended: false }));
exp.use(bodyParser.json());
exp.use(cookieParser());

exp.get("/", async (req, res) => {
  const uid = req.cookies.uid;
  if (uid) {
    try {
      let user = await get_data(uid);
      const display_name = user.displayName;
      res.render("index", { loggedIn: true, display_name: display_name });
    } catch (error) {
      res.render("index", { loggedIn: false, display_name: "UNKNOWN" });
    }
  } else {
    res.render("index", { loggedIn: false, display_name: "UNKNOWN" });
  }
});

exp.post("/login_user", (req, res) => {
  const data = req.body;
  const email = data["email"];
  const password = data["pass"];
  console.log(email, password);
  signInWithEmailAndPassword(auth, email, password)
    .then((response) => {
      uid = response.user.uid;
      res.cookie("uid", uid, {
        maxAge: 3600000,
        httpOnly: true,
      });
      const data = {
        status: "true",
        message: "Successfully Signed In!",
      };
      res.send(data);
    })
    .catch((error) => {
      const data = {
        status: "false",
        message: "Error: " + String(error),
      };
      res.send(data);
    });
});

exp.post("/apply", (req, res) => {
  try {
    const data = req.body;
    const accountDB = db.collection("volunteers_list").doc();
    accountDB.set(data);
    const response = {
      message: "Submitted your application!",
      status: true
    }
    res.send(response)
  } catch (error) {
    const response = {
      message: "Error occured:- ", error,
      status: false
    }
    res.send(response)
  }
});

exp.post("/signup_user", async (req, res) => {
  const data = req.body;
  const first_name = data["first_name"];
  const last_name = data["last_name"];
  const email = data["email"];
  const password = data["pass"];
  const account_type = data["type"];
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(user, {
      displayName: String(first_name) + " " + String(last_name),
    });
    let account_data = {
      uid: user.uid,
      type: account_type,
      email: email,
    };
    res.cookie("uid", user.uid, {
      maxAge: 3600000,
      httpOnly: true,
    });
    const accountDB = db.collection("account_type").doc();
    accountDB.set(account_data);
    const response = {
      message: "Account Created Succesfully!",
      status: true,
    };
    res.send(response);
  } catch (error) {
    const response = {
      message: "Error occured:-" + error,
      status: false,
    };
    res.send(response);
  }
});

exp.get("/application", (req, res) => {
  const uid = req.cookies.uid;
  if (!uid) {
    res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public/application.html"));
});

exp.get("/login", (req, res) => {
  const uid = req.cookies.uid;
  if (uid) {
    res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public/login.html"));
});

exp.get("/sign_up", (req, res) => {
  const uid = req.cookies.uid;
  if (uid) {
    res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public/SignUp.html"));
});

exp.get("/explication", (req, res) => {
  res.sendFile(path.join(__dirname, "public/explication.html"));
});

exp.listen(port, () => {
  console.log(`Example exp listening on port ${port}`);
});
