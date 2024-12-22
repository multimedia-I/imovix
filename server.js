import express from "express";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import cors from "cors";
import path from "path";
import * as fs from "fs";
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

app.listen(3000, () => {
    console.log("Servidor na porta 3000");
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
    const query = "SELECT id, title, short_description, price, thumbnail_path FROM properties WHERE highlight_status = 1";
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
        GROUP BY p.id, t.typology;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao carregar imóveis" });
        res.json(results);
    });
});

//Lista filtrada de imoveis
app.get("/api/properties?typology_id=:id", (req, res) => {
    const query = `
        SELECT p.id, p.title, p.description, t.typology AS typology, p.price 
        FROM properties p
        LEFT JOIN typologies t ON p.typology_id = t.id
        WHERE t.id = ${req.params.typology_id}
        GROUP BY p.id, t.typology;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao carregar imóveis" });
        res.json(results);
    });
});


// Detalhes do imovel
app.get("/api/properties/:id", (req, res) => {
    const propertyId = req.params.id;
    const query = `
        SELECT p.id, p.title, p.description, p.price, t.typology AS typology, 
               GROUP_CONCAT(f.photo_path) AS photos
        FROM properties p
        LEFT JOIN typologies t ON p.typology_id = t.id
        LEFT JOIN photos f ON p.id = f.property_id
        WHERE p.id = ?
        GROUP BY p.id, t.typology;
    `;

    db.query(query, [propertyId], (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao carregar os detalhes do imóvel" });
        if (results.length === 0) return res.status(404).json({ error: "Imóvel não encontrado" });

        res.json(results[0]);
    });
});

// Registar um novo utilizador
app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;

    // Verificação dos campos obrigatórios
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    // Verificar se o utilizador já existe
    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Erro ao verificar o utilizador." });
        }
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: "Email já registado." });
        }

        // Encriptar a password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Inserir o novo utilizador na base de dados
        const insertUserQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(insertUserQuery, [name, email, hashedPassword], (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Erro ao registar utilizador." });
            }
            return res.status(201).json({ success: true, message: "Utilizador registado com sucesso!" });
        });
    });
});


// Login
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Erro ao verificar o utilizador." });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Email não registado." });
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Password incorreta." });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, "secret", { expiresIn: "1h" });

        res.json({ success: true, message: "Login realizado com sucesso!", token });
    });
});

// Upload Fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempPath = `public/uploads/temp/`;
        fs.mkdirSync(tempPath, { recursive: true });
        cb(null, tempPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Novo Imovel
app.post("/api/new-property", upload.array("photos", 5), (req, res) => {
    const { title, short_description, description, price, typology_id } = req.body;

    if (!title || !short_description || !description || !price || !typology_id) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    const userId = req.user.id;

    const sql = "INSERT INTO properties (title, short_description, description, price, typology_id, user_id) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, short_description, description, price, typology_id, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Erro ao registar o imóvel." });
        }

        const propertyId = result.insertId;
        let finalPath;
        const destDir = `public/uploads/property${propertyId}`;
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const photoValues = [];

        req.files.forEach(file => {
            const finalPath = path.join(destDir, file.filename);
            fs.renameSync(file.path, finalPath);
            photoValues.push([propertyId, finalPath.replace("public/", "")]);
        });

        const photoSql = "INSERT INTO photos (property_id, photo_path) VALUES ?";

        db.query(photoSql, [photoValues], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Erro ao guardar fotos." });
            }
            res.status(201).json({ success: true, message: "Imóvel registado com sucesso!" });
        });
    });
});

// Envio de formulário de contacto
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    console.log("Mensagem de contacto recebida:");
    console.log("Nome:", name);
    console.log("Email:", email);
    console.log("Mensagem:", message);

    res.json({ success: true, message: "Mensagem enviada com sucesso!" });
});