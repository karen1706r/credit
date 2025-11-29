const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PATCH,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const loanRoutes = require("./routes/loanRoutes");
app.use("/api/loan", loanRoutes);

// Conexión MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🚀 MongoDB conectado correctamente"))
  .catch((err) => console.error("❌ Error al conectar MongoDB:", err));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("CrediLite API funcionando correctamente");
});

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
