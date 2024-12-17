const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "db-p4ssW0rd!",
    database: "jdbc:mysql://localhost:3306/imovix"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Conectado ao banco de dados.");
});

// Upload de imagens
const upload = multer({ dest: "uploads/" });

// User Registration
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err) => {
        if (err) return res.status(500).send("Erro ao registrar utilizador");
        res.status(200).send("Utilizador registado com sucesso!");
    });
});

// Imóveis em destaque
app.get("/highlights", (req, res) => {
    const query = "SELECT title, short_description, price, thumbnail_path FROM properties";
    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Erro ao carregar imóveis.");
        res.json(results);
    });
});

//Lista completa de imoveis
app.get("/properties", (req, res) => {
    const query = `
        SELECT i.id, i.title, i.description, i.price, i.short_description, GROUP_CONCAT(f.photo_path) AS photos
        FROM properties i
        LEFT JOIN photos f ON i.id = f.property_id
        GROUP BY i.id
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao carregar imóveis" });
        res.json(results);
    });
});

// Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err || results.length === 0) return res.status(401).send("Credenciais inválidas");
        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).send("Credenciais inválidas");

        const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
        res.status(200).json({ token });
    });
});

// New property
app.post("/properties", upload.array("fotos", 5), (req, res) => {
    const { title, description, price, typology_id } = req.body;
    const fotos = req.files.map((file) => file.path);
    const sql = "INSERT INTO imoveis (title, description, price, typology_id) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, description, price, typology_id], (err, results) => {
        if (err) return res.status(500).send("Erro ao adicionar imóvel");
        const property_id = results.insertId;

        // Guardar as fotos
        const photoSql = "INSERT INTO photos (property_id, photo_path) VALUES ?";
        const photoValues = photos.map((photo) => [property_id, foto]);
        db.query(fotoSql, [fotoValues], (err) => {
            if (err) return res.status(500).send("Erro ao guardar fotos");
            res.status(200).send("Imóvel adicionado com sucesso!");
        });
    });
});

app.listen(3000, () => {
    console.log("Servidor na porta 3000");
});
