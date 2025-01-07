document.addEventListener("DOMContentLoaded", () => {
    //Carregar detalhes do imovel
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

                const limitedPhotos = photos.slice(0, 3);
                const photoGallery = limitedPhotos.map((photo, index) =>
                    `<img src="${photo}" class="img-thumbnail mb-2 me-2 photo-item" 
                          style="width: 150px; height: 100px; cursor: pointer;"
                          data-index="${index}" alt="Foto ${index + 1}">`
                ).join("");

                const morePhotosIndicator = photos.length > 3
                    ? `<div class="more-photos mb-2 me-2" style="width: 150px; height: 100px; 
                          display: flex; align-items: center; justify-content: center; 
                          background: #f0f0f0; cursor: pointer;" data-index="4">
                          <span style="font-size: 1.5rem; font-weight: bold;">+${photos.length - 3}</span>
                       </div>`
                    : "";

                detailsContainer.innerHTML = `
                    <h2>${property.title}</h2>
                    <p>${property.description}</p>
                    <p><strong>Preço:</strong> € ${property.price}</p>
                    <p><strong>Tipologia:</strong> ${property.typology}</p>
                    <div class="d-flex flex-wrap">${photoGallery}${morePhotosIndicator}</div>
                `;

                const photoItems = document.querySelectorAll(".photo-item");
                photoItems.forEach((item, index) => {
                    item.addEventListener("click", () => {
                        openPhotoGallery(photos, index);
                    });
                });
            })
            .catch(err => {
                console.error("Erro ao carregar detalhes do imóvel:", err);
                detailsContainer.innerHTML = "<p>Erro ao carregar os detalhes do imóvel.</p>";
            });
    };

    const openPhotoGallery = (photos, startIndex) => {
        const carouselInner = document.getElementById("carousel-images");
        carouselInner.innerHTML = "";

        photos.forEach((photo, index) => {
            const isActive = index == startIndex ? "active" : "";
            carouselInner.innerHTML += `
                <div class="carousel-item ${isActive}">
                    <img src="${photo}" class="d-block w-100" alt="Foto ${index + 1}">
                </div>
            `;
        });

        const photoModal = new bootstrap.Modal(document.getElementById("photoModal"));
        photoModal.show();
    };

    if (detailsContainer) {
        loadPropertyDetails();
    }
});