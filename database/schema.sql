CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

CREATE TABLE typologies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    typology VARCHAR(255)
);

CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    typology_id INT,
    user_id INT,
    FOREIGN KEY (typology_id) REFERENCES typologies(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT,
    photo_path VARCHAR(255),
    FOREIGN KEY (property_id) REFERENCES properties(id)
);