import express from "express";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "db-p4ssW0rd!",
    database: "imovix"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Conectado à base de dados.");
});

//Carrega as Tipologias
app.get("/api/typologies", (req, res) => {
    const query = "SELECT id, typology FROM typologies";
    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Erro ao buscar tipologias.");
        res.json(results);
    });
});

// Imóveis em destaque
app.get("/api/highlights", (req, res) => {
    const query = "SELECT title, short_description, price, thumbnail_path FROM properties";
    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Erro ao carregar imóveis.");
        res.json(results);
    });
});

//Lista completa de imoveis
app.get("/api/properties", (req, res) => {
    const query = `
        SELECT p.id, p.title, p.description, t.typology AS typology, p.price 
        FROM properties p
        LEFT JOIN typologies t ON p.typology_id = t.id
        LEFT JOIN photos f ON p.id = f.property_id
        GROUP BY p.id, t.typology;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao carregar imóveis" });
        res.json(results);
    });
});

// Upload de imagens
const upload = multer({ dest: "uploads/" });

// User Registration
app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err) => {
        if (err) return res.status(500).send("Erro ao registrar utilizador");
        res.status(200).send("Utilizador registado com sucesso!");
    });
});

// Login
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send("Utilizador inválido");
        }

        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send("Password incorreta");
        }

        // Gera o token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, "secret", { expiresIn: "1h" });
        res.json({ token });
    });
});

// New property
app.post("/api/new-property", upload.array("fotos", 5), (req, res) => {
    const { title, description, price, typology_id } = req.body;
    const photos = req.files.map((file) => file.path);
    const sql = "INSERT INTO properties (title, description, price, typology_id) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, description, price, typology_id], (err, results) => {
        if (err) return res.status(500).send("Erro ao adicionar imóvel");
        const property_id = results.insertId;

        // Guardar as fotos
        const photoSql = "INSERT INTO photos (property_id, photo_path) VALUES ?";
        const photoValues = photos.map((photo) => [property_id, foto]);
        db.query(photoSql, [photoValues], (err) => {
            if (err) return res.status(500).send("Erro ao guardar fotos");
            res.status(200).send("Imóvel adicionado com sucesso!");
        });
    });
});

app.listen(3000, () => {
    console.log("Servidor na porta 3000");
});
