const express = require('express');
const app = express();
const pool = require("./config/db");
const becrypt=require('bcrypt')
const jwt=require("jsonwebtoken")
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Middleware
app.use((req, res, next) => {
    console.log("Welcome to the app");
    next();
});






//Authorisation 
//👉 req.headers
//It’s an object in Express
//Contains all HTTP headers sent by client

const Authorisation = (req, res, next) => {
  const header = req.headers.authorization;
  // 1. Check header exists
  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }
  // 2. Check Bearer format
  if (!header.startsWith("Bearer")) {
    return res.status(401).json({ message: "Invalid token format" });
  }
  // 3. Extract token
  const token = header.split(" ")[1];
  try {
    // 4. Verify token
    const decoded = jwt.verify(token, "secretkey");
    // 5. Attach user
    req.user = decoded;
    // 6. Go to next middleware
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};






// CREATE
app.post("/tasks", Authorisation, async (req, res) => {
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title required" });
    }

    try {
        console.log("USER:", req.user);
        const result = await pool.query(
            "INSERT INTO tasks (title,user_id) VALUES ($1,$2) RETURNING *",
            [title,req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


app.patch("/tasks/:id", Authorisation, async (req, res) => { //patch because only part of the data is updated if we do put then reddundacy
//  will came put only used for when we update whole part 
    const { id } = req.params;
    const { completed } = req.body;

    try {
        const result = await pool.query(
            "UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
            [completed, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// GET ALL
app.get("/tasks", Authorisation, async (req, res) => {
    const { status, search } = req.query;
    const page=req.query.page||1;
    const limit=req.query.limit||5
    const offset=(1-page)*limit

    try {
        let query = "SELECT * FROM tasks WHERE user_id = $1";
        let values = [req.user.id];

        // filter by status
        if (status !== undefined) {
            values.push(status === "true");
            query += ` AND completed = $${values.length}`;
        }

        // search by title
        if (search) {
            values.push(`%${search}%`);
            query += ` AND title ILIKE $${values.length}`;
        }

        query += " ORDER BY id";


        //pagination 
        values.push(limit);
        values.push(offset);

        query += ` ORDER BY id LIMIT $${values.length - 1} OFFSET $${values.length}`;
        const result = await pool.query(query, values);

        res.json(page,offset,result.rows);
    } catch (err) {
        res.status(500).send("Server error");
    }
});




// UPDATE
app.put("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title required" });
    }

    try {
        const result = await pool.query(
            "UPDATE tasks SET title = $1 WHERE id = $2 and user_id=&3 RETURNING *",
            [title, id,req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// DELETE
app.delete("/tasks/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id=$2 RETURNING *",
            [id,req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

//SIGN UP
const bcrypt = require("bcrypt");

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // 2. Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert user
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );

    // 5. Send safe response
    res.status(201).json({
      message: "User created",
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
//LOG IN


app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        // find user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = result.rows[0];

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            "secretkey",
            { expiresIn: "10m" }
        );

        res.json({ token });
        console.log("login")

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


app.listen(5000, () => {
    console.log("Listening at 5000");
});