document.addEventListener("DOMContentLoaded", () => {
    const propertyForm = document.getElementById("new-property-form");
    const propertyMessage = document.getElementById("property-message");
    const typologySelect = document.getElementById("typology");

    const loadTypologies = () => {
        fetch("http://localhost:3000/api/typologies")
            .then(response => response.json())
            .then(data => {
                typologySelect.innerHTML = data.map(typology =>
                    `<option value="${typology.id}">${typology.typology}</option>`
                ).join("");
            })
            .catch(err => {
                console.error("Erro ao carregar tipologias:", err);
            });
    };

    if (typologySelect) loadTypologies();

    if (propertyForm) {
        propertyForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!propertyForm.checkValidity()) {
                propertyForm.classList.add("was-validated");
                return;
            }

            const formData = new FormData(propertyForm);

            fetch("http://localhost:3000/api/new-property", {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        propertyMessage.textContent = "Imóvel registado com sucesso!";
                        propertyMessage.style.color = "green";
                        propertyForm.style.display = "none";
                        propertyForm.reset();
                    } else {
                        propertyMessage.textContent = "Erro: " + data.message;
                        propertyMessage.style.color = "red";
                    }
                })
                .catch(err => {
                    console.error("Erro ao registar imóvel:", err);
                    propertyMessage.textContent = "Erro ao registar imóvel. Tente novamente mais tarde.";
                    propertyMessage.style.color = "red";
                });
        });
    }
});
