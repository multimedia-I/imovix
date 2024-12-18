window.onload = copyright();

function copyright()  {
    const copyrightYear = new Date().getFullYear();
    document.getElementById("copyright").innerHTML = copyrightYear + ' &copy; Copyright';
}

//Fetch para obter imoveis em destaque
document.addEventListener("DOMContentLoaded", () => {
    // Containers e elementos
    const propertyCardsContainer = document.getElementById("property-cards");
    const propertyListContainer = document.getElementById("property-list");
    const filterForm = document.getElementById("filter-form");
    const typologySelect = document.getElementById("typology");
    const menuLogin = document.getElementById("menu-login");
    const menuRegisterProperty = document.getElementById("menu-register-property");

    // Carregar imóveis em destaque no index.html
    const loadHighlightedProperties = () => {
        fetch("http://localhost:3000/api/highlights") // Endpoint no backend para imóveis em destaque
            .then(response => response.json())
            .then(properties => {
                propertyCardsContainer.innerHTML = ""; // Limpa a lista anterior
                properties.forEach(property => {
                    const formatedPrice = formatPrice(property.price);
                    const card = `
                        <div class="col-md-4 mb-4">
                        <a href="details.html?id=${property.id}" class="text-decoration-none text-dark">
                            <div class="card h-100 shadow-sm">
                                <img src="${property.thumbnail_path || 'images/default.webp'}" 
                                     class="card-img-top" 
                                     alt="${property.title}">
                                <div class="card-body">
                                    <h5 class="card-title">${property.title}</h5>
                                    <p>${property.short_description}</p>
                                    <p><strong>Preço:</strong> ${formatedPrice}€</p>
                                </div>
                            </div>
                            </a>
                        </div>
                    `;
                    propertyCardsContainer.innerHTML += card;
                });
            })
            .catch(err => console.error("Erro ao carregar imóveis em destaque:", err));
    };

    // Carregar lista de tipologias de imoveis em properties.html
    const loadTypologies = () => {
        fetch("http://localhost:3000/api/typologies") // Endpoint para buscar as tipologias
            .then(response => response.json())
            .then(typologies => {
                typologies.forEach(typology => {
                    const option = document.createElement("option");
                    option.value = typology.id;
                    option.textContent = typology.typology;
                    typologySelect.appendChild(option);
                });
            })
            .catch(err => console.error("Erro ao carregar tipologias:", err));
    };

    // Carregar lista de imóveis no properties.html
    const loadProperties = (typologyId = "") => {
        let url = "http://localhost:3000/api/properties";
        if (typologyId) url += `?typology_id=${typologyId}`;

        fetch(url)
            .then(response => response.json())
            .then(properties => {
                propertyListContainer.innerHTML = ""; // Limpa o container
                properties.forEach(property => {
                    const photos = property.photos ? property.photos.split(",").slice(0, 5) : [];
                    const gallery = photos.map(photo =>
                        `<img src="${photo}" class="img-thumbnail me-2 mb-2" style="width: 100px; height: 100px;">`
                    ).join("");

                    const formatedPrice = formatPrice(property.price);
                    // Estrutura de cada card de propriedade
                    const card = `
                        <div class="col-md-4 mb-4">
                            <div class="card h-100 shadow-sm">
                                <div class="card-body">
                                    <h5 class="card-title">${property.title}</h5>
                                    <h6 class="card-title">${property.typology}</h6>
                                    <p>${property.description}</p>
                                    <p><strong>Preço:</strong> ${formatedPrice}€</p>
                                    <div class="d-flex flex-wrap">${gallery}</div>
                                </div>
                            </div>
                        </div>
                    `;
                    propertyListContainer.innerHTML += card;
                });
            })
            .catch(err => {
                console.error("Erro ao carregar propriedades:", err);
                propertyListContainer.innerHTML = "<p class='text-danger'>Erro ao carregar as propriedades.</p>";
            });

        // Atualizar menus consoante autenticação
        if (isAuthenticated()) {
            menuLogin.textContent = "Logout";
            menuLogin.href = "#";
            menuLogin.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
            menuRegisterProperty.style.display = "block";
        } else {
            menuLogin.textContent = "Login";
            menuLogin.href = "login.html";
            menuRegisterProperty.style.display = "none";
        }
    };

    // Detectar página e carregar o conteúdo correspondente
    if (propertyCardsContainer) {
        loadHighlightedProperties();
    }

    if (propertyListContainer && filterForm && typologySelect) {
        loadTypologies();
        loadProperties();

        // Aplicar filtro ao enviar o formulário
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const typologyId = typologySelect.value;
            loadProperties(typologyId); // Recarrega imóveis filtrados
        });
    }

    function formatPrice(price) {
        const [integer, decimal] = price.split('.');
        const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return `${formattedInteger},${decimal}`;
    }

    function isAuthenticated() {
        return localStorage.getItem("token") !== null;
    }

    function logout() {
        localStorage.removeItem("token");
        window.location.reload();
    }
});

//Carregar detalhes do imovel
document.addEventListener("DOMContentLoaded", () => {
    const detailsContainer = document.getElementById("property-details");

    const loadPropertyDetails = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get("id");

        if (!propertyId) {
            detailsContainer.innerHTML = "<p>Imóvel não encontrado.</p>";
            return;
        }

        fetch(`http://localhost:3000/api/properties/${propertyId}`)
            .then(response => response.json())
            .then(property => {
                const photos = property.photos ? property.photos.split(",") : [];
                const photoGallery = photos.map(photo =>
                    `<img src="${photo}" class="img-thumbnail mb-2" style="width: 150px; height: 100px;">`
                ).join("");

                detailsContainer.innerHTML = `
                    <h2>${property.title}</h2>
                    <p>${property.description}</p>
                    <p><strong>Preço:</strong> € ${property.price}</p>
                    <p><strong>Tipologia:</strong> ${property.typology}</p>
                    <div class="d-flex flex-wrap">${photoGallery}</div>
                `;
            })
            .catch(err => {
                console.error("Erro ao carregar os detalhes do imóvel:", err);
                detailsContainer.innerHTML = "<p>Erro ao carregar os detalhes do imóvel.</p>";
            });
    };

    if (detailsContainer) {
        loadPropertyDetails();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const backgroundMusic = document.getElementById("background-music");
    const soundIcon = document.getElementById("sound-icon");

    const pauseMusic = "bi-volume-mute-fill";
    const playMusic = "bi-volume-up-fill";

    soundIcon.addEventListener("click", () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            soundIcon.classList.remove(pauseMusic);
            soundIcon.classList.add(playMusic);
        } else {
            backgroundMusic.pause();
            soundIcon.classList.remove(playMusic);
            soundIcon.classList.add(pauseMusic);
        }
    });
});

// Formulário de contacto
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    const contactMessage = document.getElementById("contact-message");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                message: document.getElementById("message").value
            };

            fetch("http://localhost:3000/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        contactMessage.style.color = "green";
                        contactMessage.textContent = "Mensagem enviada com sucesso!";
                        contactForm.reset();
                    } else {
                        contactMessage.style.color = "red";
                        contactMessage.textContent = "Erro: " + data.message;
                    }
                })
                .catch(err => {
                    console.error("Erro ao enviar o formulário:", err);
                    contactMessage.style.color = "red";
                    contactMessage.textContent = "Erro ao enviar a mensagem. Tente novamente mais tarde.";
                });
        });
    }
});

