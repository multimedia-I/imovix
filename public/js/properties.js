document.addEventListener("DOMContentLoaded", () => {

    // Carregar imóveis em destaque no index.html
    const loadHighlightedProperties = () => {
        fetch("http://localhost:3000/api/highlights") // Endpoint no backend para imóveis em destaque
            .then(response => response.json())
            .then(properties => {
                propertyCardsContainer.innerHTML = "";
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

    //Carregar lista de tipologias para filtro
    const loadTypologies = () => {
        fetch("http://localhost:3000/api/typologies")
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
                    // Estrutura de cada card de imovel
                    const card = `
                        <div class="col-md-4 mb-4">
                            <div class="card h-100 shadow-sm">
                            <a href="details.html?id=${property.id}" class="text-decoration-none text-dark">
                                <div class="card-body">
                                    <h5 class="card-title">${property.title}</h5>
                                    <h6 class="card-title">${property.typology}</h6>
                                    <p>${property.description}</p>
                                    <p><strong>Preço:</strong> ${formatedPrice}€</p>
                                    <div class="d-flex flex-wrap">${gallery}</div>
                                </div>
                                </a>
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
    };

    // Detectar página e carregar o conteúdo correspondente
    if (propertyCardsContainer) {
        loadHighlightedProperties();
    }

    if (propertyListContainer && filterForm && typologySelect) {
        loadTypologies();
        loadProperties();
    }

    // Aplicar filtro ao enviar o formulário
    typologySelect.addEventListener("change", function () {
        const typologyId = typologySelect.value;
        loadProperties(typologyId);
    });

    function formatPrice(price) {
        const [integer, decimal] = price.split('.');
        const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return `${formattedInteger},${decimal}`;
    }
});

