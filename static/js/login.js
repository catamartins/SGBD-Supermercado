document.addEventListener('DOMContentLoaded', () => {
    const inputLogin = document.getElementById('login');
    if (inputLogin) inputLogin.focus();
});

async function fazerLogin() {
    const loginInput = document.getElementById('login');
    const senhaInput = document.getElementById('senha');
    const feedback = document.getElementById('feedback-login');

    if (!loginInput || !senhaInput) {
        console.error("Inputs de login/senha não encontrados no HTML.");
        return;
    }

    const login = loginInput.value;
    const senha = senhaInput.value;

    if (!login || !senha) {
        if(feedback) feedback.innerText = "Preencha todos os campos!";
        return;
    }

    try {
        const res = await fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ login, senha })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            const cargo = data.usuario.cargo;
            
            if (cargo === 'Operador de Caixa') {
                window.location.href = '/pagina/vendas';
            } else if (cargo === 'Açougueiro' || cargo === 'Repositor') {
                window.location.href = '/pagina/estoque';
            } else {
                window.location.href = '/pagina/home'; 
            }
        } else {
            if(feedback) feedback.innerText = data.erro;
            else alert(data.erro);
        }
    } catch (error) {
        console.error(error);
        if(feedback) feedback.innerText = "Erro de conexão com o servidor.";
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fazerLogin();
});