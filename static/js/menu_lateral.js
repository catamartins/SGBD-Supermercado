document.addEventListener('DOMContentLoaded', () => {
    verificarAcesso();
    ativarLinkAtual();
});

function verificarAcesso() {
    const user = JSON.parse(localStorage.getItem('usuario'));

    if (!user && window.location.pathname !== '/') {
        window.location.href = '/';
        return;
    }

    if (!user) return;

    const cargo = user.cargo;
    console.log("Usuário:", user.nome, "| Cargo:", cargo);

    
    if (cargo === 'Diretor Financeiro') {
        esconder('menu-vendas');
        esconder('menu-estoque');
        esconder('menu-funcionarios');
    }
    
    else if (cargo === 'Operador de Caixa') {
        esconder('menu-home');
        esconder('menu-estoque');
        esconder('menu-historico');
        esconder('menu-funcionarios');
    }

}

function esconder(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function ativarLinkAtual() {
    const path = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        if (path.includes(link.getAttribute('href'))) {
            link.parentElement.classList.add('active'); 
            link.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            link.style.borderRadius = '8px';
        }
    });
}

function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/';
}