const overlay = document.getElementById("overlay");

const loginPopup = document.getElementById("login-popup");
const closeLogin = document.getElementById("close-login");
const loginLink = document.getElementById("menu-login");

const registerPopup = document.getElementById("register-popup");
const closeRegister = document.getElementById("close-register");
const registerLink = document.getElementById("menu-register");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const loginIcon = document.getElementById("login-icon");
const subMenuLogin = document.getElementById("sub-menu-login");

const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");

const menuLogin = document.getElementById("menu-login");
const menuRegisterProperty = document.getElementById("menu-register-property");

document.addEventListener("DOMContentLoaded", () => {

    // Abrir pop-up
    const openPopup = (popup) => {
        overlay.style.display = "block";
        popup.style.display = "block";
    };

    // Fechar pop-up
    const closePopup = (popup) => {
        overlay.style.display = "none";
        popup.style.display = "none";
    };

    // Abrir e fechar o pop-up de Login
    if (loginLink && loginPopup) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            openPopup(loginPopup);
        });

        closeLogin.addEventListener("click", () => closePopup(loginPopup));
    }

    // Abrir e fechar o pop-up de Registo
    if (registerLink && registerPopup) {
        registerLink.addEventListener("click", (e) => {
            e.preventDefault();
            openPopup(registerPopup);
        });

        closeRegister.addEventListener("click", () => closePopup(registerPopup));
    }

    // Fechar o pop-up ao clicar no overlay
    overlay.addEventListener("click", () => {
        closePopup(loginPopup);
        closePopup(registerPopup);
    });
});

// Login
document.addEventListener("DOMContentLoaded", () => {

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loginMessage.style.color = "green";
                        loginMessage.textContent = "Login realizado com sucesso!";
                        localStorage.setItem("token", data.token);
                        setTimeout(() => {
                            loginPopup.style.display = "none";
                            overlay.style.display = "none";
                            loginMessage.textContent = "";
                            window.location.reload();
                        }, 2000);
                    } else {
                        loginMessage.style.color = "red";
                        loginMessage.textContent = "Erro: " + data.message;
                    }
                })
                .catch(err => {
                    loginMessage.style.color = "red";
                    loginMessage.textContent = "Erro ao comunicar com o servidor.";
                    console.error("Erro no login:", err);
                });
        });
    }
});

// Verifica se existe um login
document.addEventListener("DOMContentLoaded", () => {

    const iconLogin = "bi-person"
    const iconLogout = "bi-box-arrow-right"

    if (localStorage.getItem("token")) {
        loginIcon.classList.remove(iconLogin);
        loginIcon.classList.add(iconLogout);
        subMenuLogin.style.display = "none";
        menuLogin.href = "#";
        loginIcon.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "index.html"
        });
        menuRegisterProperty.style.display = "block";
    } else {
        loginIcon.classList.remove(iconLogout);
        loginIcon.classList.add(iconLogin);
        menuLogin.href = "#";
        menuRegisterProperty.style.display = "none";
    }
});

// Registar novo utilizador
document.addEventListener("DOMContentLoaded", () => {

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("register-name").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            })
                .then(response => response.json())
                .then(data => {
                    // Mensagem de sucesso ou erro
                    if (data.success) {
                        registerMessage.style.color = "green";
                        registerMessage.textContent = "Utilizador registado com sucesso!";
                        registerForm.reset();
                        setTimeout(() => {
                            registerPopup.style.display = "none";
                            overlay.style.display = "none";
                            registerMessage.textContent = "";
                        }, 2000);
                    } else {
                        registerMessage.style.color = "red";
                        registerMessage.textContent = "Erro ao registar: " + data.message;
                    }
                })
                .catch(err => {
                    console.error("Erro no registo:", err);
                    alert("Erro ao comunicar com o servidor.");
                });
        });
    }
});