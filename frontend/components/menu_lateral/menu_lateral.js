fetch("/components/menu_lateral/menu_lateral.html")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao carregar o menu lateral: ${response.statusText}`);
        }
        return response.text();
    })
    .then(data => {
        document.getElementById("menu_lateral").innerHTML = data;
    })
    .catch(error => console.error("Erro ao carregar o menu lateral:", error));
