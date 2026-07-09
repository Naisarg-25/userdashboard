const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(cors());
// Serve static files so you can open pages via http://localhost:3000/
app.use(express.static(__dirname));

const SecretKey = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected"))
  .catch(err => {
    console.error(err);
    console.error(err.message);
  });

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String }
});

const User = mongoose.model("User", userSchema);

// GET all users
app.get("/users", (req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ message: err.message }));
});

app.post("/users", (req, res) => {
  const newUser = new User(req.body);
  newUser.save()
    .then(user => res.status(201).json(user))
    .catch(err => res.status(400).json({ message: err.message }));
});

app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  User.findByIdAndUpdate(id, updatedUser, { new: true })
    .then(user => res.json(user))
    .catch(err => res.status(400).json({ message: err.message }));
});

app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  User.findByIdAndDelete(id)
    .then(() => res.json({ message: "User deleted" }))
    .catch(err => res.status(400).json({ message: err.message }));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email, password })
    .then(user => {
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id, email: user.email }, SecretKey, { expiresIn: "1h" });
      res.json({ token });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

function auth(req, res, next){
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if(!token) return res.status(401).json({msg:"No Token, access denied"});

  try{
    const verifyed = jwt.verify(token, SecretKey);
    req.user = verifyed;
    next();
  }
  catch{
    res.status(400).json({msg:"invalid token"});
  }
};
  
app.get("/profile", auth, (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      if(!user) return res.status(404).json({ message: "User not found" });
      res.json({ id: user._id, name: user.name, email: user.email });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
