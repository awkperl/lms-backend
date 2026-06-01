//const pool = require("../config/db");
//const bcrypt = require("bcryptjs");
//const jwt = require("jsonwebtoken");

/**exports.register = async (req,res)=>{
  const {name,email,password} = req.body;
  const hash = await bcrypt.hash(password,10);
  const r = await pool.query(
    "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING *",
    [name,email,hash]
  );
  res.json(r.rows[0]);
};**/
/**exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(req.body); // debug

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Name, email and password are required"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const r = await pool.query(
      "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING *",
      [name, email, hash]
    );

    res.json(r.rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req,res)=>{
  const {email,password} = req.body;
  const r = await pool.query("SELECT * FROM users WHERE email=$1",[email]);
  if(!r.rows.length) return res.status(404).json({msg:"User not found"});
  const user = r.rows[0];
  const ok = await bcrypt.compare(password,user.password_hash);
  if(!ok) return res.status(400).json({msg:"Invalid credentials"});
  const token = jwt.sign({id:user.id, role:user.role}, process.env.JWT_SECRET);
  res.json({token,user});
};
**/
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, email, hashedPassword, role || "student"]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};