document.addEventListener("DOMContentLoaded", () => {
    const newPropertyForm = document.getElementById("new-property-form");
    const messageContainer = document.getElementById("property-message");

    if (newPropertyForm) {
        if (!isAuthenticated()) {
            alert("Você precisa estar autenticado para registrar um imóvel.");
            return;
        }

        newPropertyForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(newPropertyForm);
            fetch("http://localhost:3000/api/new-property", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            })
                .then(response => response.text())
                .then(message => {
                    messageContainer.innerText = message;
                    newPropertyForm.reset();
                })
                .catch(err => console.error("Erro ao registrar imóvel:", err));
        });
    }

    function loadTypologies() {
        fetch("http://localhost:3000/api/typologies")
            .then(response => response.json())
            .then(tipologies => {
                const typologySelect = document.getElementById("typology");
                tipologies.forEach(typology => {
                    const option = document.createElement("option");
                    option.value = typology.id;
                    option.textContent = typology.tipo;
                    typologySelect.appendChild(option);
                });
            })
            .catch(err => console.error("Erro ao carregar tipologias:", err));
    }

// Carregar tipologias ao iniciar
    if (document.getElementById("typology")) {
        loadTypologies();
    }
});
