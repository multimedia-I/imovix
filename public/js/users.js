document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
        .then(response => response.text())
        .then(message => {
            document.getElementById("register-message").innerText = message;
        })
        .catch(err => console.error("Erro ao registar:", err));

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })
                .then(response => {
                    if (!response.ok) throw new Error("Credenciais inválidas");
                    return response.json();
                })
                .then(data => {
                    localStorage.setItem("token", data.token);
                    alert("Login realizado com sucesso!");
                    window.location.href = "index.html";
                })
                .catch(err => {
                    document.getElementById("login-message").innerText = "Credenciais inválidas!";
                    console.error("Erro ao fazer login:", err);
                });
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("overlay");

    // Pop-ups
    const loginPopup = document.getElementById("login-popup");
    const closeLogin = document.getElementById("close-login");
    const loginLink = document.getElementById("menu-login");

    const registerPopup = document.getElementById("register-popup");
    const closeRegister = document.getElementById("close-register");
    const registerLink = document.getElementById("menu-register");

    // Função para abrir um pop-up
    const openPopup = (popup) => {
        overlay.style.display = "block";
        popup.style.display = "block";
    };

    // Função para fechar um pop-up
    const closePopup = (popup) => {
        overlay.style.display = "none";
        popup.style.display = "none";
    };

    // Eventos para abrir e fechar o pop-up de Login
    if (loginLink && loginPopup) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            openPopup(loginPopup);
        });

        closeLogin.addEventListener("click", () => closePopup(loginPopup));
    }

    // Eventos para abrir e fechar o pop-up de Registo
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
