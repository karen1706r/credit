const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registro
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validar campos
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Faltan datos" });
    }

    // Revisar si ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Crear user
    const newUser = await User.create({
      name,
      email,
      password: hashedPass,
      phone
    });

    return res.status(201).json({ msg: "Usuario registrado", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validación
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    // comparar passwords
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ msg: "Contraseña incorrecta" });

    // crear token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      msg: "Login exitoso",
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
