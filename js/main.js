window.onload = copyright();

function copyright()  {
    const copyrightYear = new Date().getFullYear();
    document.getElementById("copyright").innerHTML = copyrightYear + '&copy; Copyright';
}

//Fetch para obter imoveis em destaque
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("property-cards");

    fetch("http://localhost:3000/highlights")
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao carregar os imóveis.");
            }
            return response.json();
        })
        .then(properties => {
    properties.forEach(property => {
        const card = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${property.thumbnail_path}" class="card-img-top" alt="${property.title}">
                    <div class="card-body">
                        <h5 class="card-title">${property.title}</h5>
                        <p class="card-text">${property.short_description}</p>
                        <p class="card-text text-primary"><strong>${property.price}</strong></p>
                        <a href="#" class="btn btn-primary">Ver Detalhes</a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
        })
        .catch(error => {
            console.error("Erro:", error);
            container.innerHTML = "<p>Erro ao carregar os imóveis. Tente novamente mais tarde.</p>";
        });

    document.addEventListener("DOMContentLoaded", () => {
        const container = document.getElementById("property-list");

        // Fetch para obter lista completa de imóveis
        fetch("http://localhost:3000/properties")
            .then(response => response.json())
            .then(properties => {
                properties.forEach(property => {
                    const fotos = property.fotos ? property.fotos.split(",").slice(0, 5) : [];
                    const gallery = fotos.map(foto => `<img src="${foto}" class="img-thumbnail me-2 mb-2" style="width: 100px; height: 100px;">`).join("");

                    const propertyCard = `
                            <div class="col-md-6 mb-4">
                                <div class="card h-100 shadow-sm">
                                    <div class="card-body">
                                        <h5 class="card-title">${property.titulo}</h5>
                                        <p><strong>Preço:</strong> ${property.preco}</p>
                                        <p><strong>Descrição:</strong> ${property.descricao}</p>
                                        <p><strong>Resumo:</strong> ${property.short_description}</p>
                                        <div><strong>Fotos:</strong></div>
                                        <div class="d-flex flex-wrap mt-2">${gallery}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    container.innerHTML += propertyCard;
                });
            })
            .catch(err => {
                console.error("Erro ao carregar propriedades:", err);
                container.innerHTML = "<p class='text-danger'>Erro ao carregar as propriedades. Tente novamente mais tarde.</p>";
            });
    });
});