window.onload = copyright();

function copyright() {
    const copyrightYear = new Date().getFullYear();
    document.getElementById("copyright").innerHTML = copyrightYear + ' &copy; Copyright';
}

// Containers e elementos
const propertyCardsContainer = document.getElementById("property-cards");
const propertyListContainer = document.getElementById("property-list");
const filterForm = document.getElementById("filter-form");
const typologySelect = document.getElementById("typology");
const menuLogin = document.getElementById("menu-login");
const menuRegisterProperty = document.getElementById("menu-register-property");

document.addEventListener("DOMContentLoaded", () => {
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

    //Controlador de audio
    const backgroundMusic = document.getElementById("background-music");
    const soundIcon = document.getElementById("sound-icon");

    const pauseMusic = "bi-volume-mute-fill";
    const playMusic = "bi-volume-up-fill";

    soundIcon.addEventListener("click", () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            soundIcon.classList.remove(playMusic);
            soundIcon.classList.add(pauseMusic);
        } else {
            backgroundMusic.pause();
            soundIcon.classList.remove(pauseMusic);
            soundIcon.classList.add(playMusic);
        }
    });

    function isAuthenticated() {
        return localStorage.getItem("token") !== null;
    }

    function logout() {
        localStorage.removeItem("token");
        window.location.reload();
    }

    // Formulário de contacto
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
                method: "POST", headers: {
                    "Content-Type": "application/json"
                }, body: JSON.stringify(formData)
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