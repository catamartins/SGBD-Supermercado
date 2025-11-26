const inputs = {
    nome: document.getElementById('nome_funcionario'),
    cpf: document.getElementById('cpf_funcionario'),
    endereco: document.getElementById('endereco_funcionario'),
    cargo: document.querySelectorAll('.card-longo:last-child select')[0],
    setor: document.querySelectorAll('.card-longo:last-child select')[1], 
    genero: document.querySelectorAll('.card-longo:last-child select')[2]
};

document.addEventListener('DOMContentLoaded', () => {
    preencherSelects();
});

function preencherSelects() {
    const filtroSetor = document.getElementById('filtro-setor');
    const setoresFiltro = ["Açougue","Padaria","Frente de Loja","Financeiro"];

    if(filtroSetor) {
        filtroSetor.innerHTML = '<option value="">Filtrar por Setor</option>';
        setoresFiltro.forEach(nome => {
            const opt = document.createElement('option');
            opt.value = nome; 
            opt.innerText = nome;
            filtroSetor.appendChild(opt);
        });
    }

    const setoresBanco = [
        {id: 1, nome: "Administração Geral"}, 
        {id: 2, nome: "Açougue"}, 
        {id: 3, nome: "Frente de Caixa"},
        {id: 4, nome: "Financeiro"},
        {id: 5, nome: "Administrativo"}
    ];
    
    if(inputs.setor) {
        setoresBanco.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id; opt.innerText = s.nome;
            inputs.setor.appendChild(opt);
        });
    }

    const cargos = ["Operador de Caixa", "Gerente", "Açougueiro", "Diretor Geral", "Diretor Financeiro"];
    if(inputs.cargo) {
        cargos.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c; opt.innerText = c;
            inputs.cargo.appendChild(opt);
        });
    }

    if(inputs.genero) {
        ["M", "F"].forEach(g => {
            const opt = document.createElement('option');
            opt.value = g; opt.innerText = g;
            inputs.genero.appendChild(opt);
        });
    }
}

async function addFuncionario() {
    const payload = {
        cpf: inputs.cpf.value,
        nome_completo: inputs.nome.value,
        cod_setor: parseInt(inputs.setor.value),
        cargo: inputs.cargo.value,
        genero: inputs.genero.value,
        endereco: inputs.endereco.value,
        salario: 1500.00
    };

    if(!payload.cpf || !payload.nome_completo || !payload.cod_setor) return alert("Preencha CPF, Nome e Setor!");

    try {
        const res = await fetch('http://127.0.0.1:8000/funcionario', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        if (res.ok) { alert("Cadastrado!"); location.reload(); }
        else { const err = await res.json(); alert("Erro: " + err.erro); }
    } catch (e) { alert("Erro conexão."); }
}

function toggleFilters() {
    const cpfInput = document.getElementById('busca-cpf');
    const setorSelect = document.getElementById('filtro-setor');
    
    if (cpfInput.value.trim() !== '') {
        setorSelect.disabled = true;
        setorSelect.value = "";
    } 
    else if (setorSelect.value.trim() !== '') {
        cpfInput.disabled = true;
        cpfInput.value = ""; 
    }
    else {
        cpfInput.disabled = false;
        setorSelect.disabled = false;
    }
}

async function filtrarFuncionarios() {
    const cpf = document.getElementById('busca-cpf').value.trim(); 
    const setor = document.getElementById('filtro-setor').value.trim();
    
    const tbody = document.getElementById('funcionarios-body');
    tbody.innerHTML = '';
    
    let apiUrl = 'http://127.0.0.1:8000/funcionario';
    let isSetorSearch = false; 
    
    if (cpf) {
        apiUrl += `?cpf=${cpf}`;
    } else if (setor) {
        apiUrl += `?setor=${setor}`;
        isSetorSearch = true; 
    } else {
        tbody.innerHTML = '<tr><td colspan="5" align="center">Preencha o CPF ou selecione um Setor.</td></tr>';
        return;
    }

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        if (res.ok) {
            let funcionariosParaRenderizar = [];
            
            if (isSetorSearch) {
                funcionariosParaRenderizar = data.funcionarios || [];
            } else {
                funcionariosParaRenderizar = [data.dados_contratuais];
            }
            
            if (funcionariosParaRenderizar.length > 0) {
                funcionariosParaRenderizar.forEach(f => {
                    const salarioFormatado = (typeof f.salario === 'number' ? f.salario : parseFloat(f.salario)).toFixed(2);
                    
                    tbody.innerHTML += `
                        <tr>
                            <td>${f.nome_completo}</td>
                            <td>${f.cargo}</td>
                            <td>${f.setor}</td>
                            <td>R$ ${salarioFormatado}</td>
                            <td>
                                <button onclick="excluirFuncionario('${f.cpf}')" style="color:red;border:none;background:none;cursor:pointer">Excluir</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                 tbody.innerHTML = '<tr><td colspan="5" align="center">Não encontrado</td></tr>';
            }

        } else {
            tbody.innerHTML = `<tr><td colspan="5" align="center">${data.erro || data.mensagem || 'Não encontrado'}</td></tr>`;
        }
    } catch (e) { 
        console.error("Erro na requisição:", e);
        tbody.innerHTML = '<tr><td colspan="5" align="center">Erro ao conectar com a API.</td></tr>';
    }
}

async function excluirFuncionario(cpf) {
    if(!confirm(`Demitir funcionário ${cpf}?`)) return;
    const res = await fetch(`http://127.0.0.1:8000/funcionario?cpf=${cpf}`, {method: 'DELETE'});
    if(res.ok) { alert("Funcionário removido."); document.getElementById('busca-nome').value = ''; filtrarFuncionarios(); }
    else alert("Erro ao remover (verifique vínculos).");
}