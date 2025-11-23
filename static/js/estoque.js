document.addEventListener('DOMContentLoaded', carregarLotes);

async function carregarLotes() {
    const res = await fetch('http://127.0.0.1:8000/estoque/lotes'); // Nova rota
    const lotes = await res.json();
    const tbody = document.querySelector('.tabela tbody');
    tbody.innerHTML = '';

    lotes.forEach(l => {
        tbody.innerHTML += `
            <tr>
                <td>${l.produto}</td>
                <td>LOTE-${l.cod_lote}</td>
                <td>${l.quantidade}</td>
                <td>${new Date(l.data_validade).toLocaleDateString()}</td>
                <td>Depósito</td>
                <td>
                    <button onclick="excluirLote(${l.cod_lote})" style="color:red;border:none;background:none;cursor:pointer">🗑️</button>
                </td>
            </tr>
        `;
    });
}

async function excluirLote(id) {
    if(!confirm("Excluir este lote?")) return;
    const res = await fetch(`http://127.0.0.1:8000/estoque/lote?cod_lote=${id}`, {method: 'DELETE'});
    if(res.ok) carregarLotes();
    else alert("Erro ao excluir.");
}

// CADASTRAR LOTE
async function cadastrarLote() {
    const payload = {
        cod_produto: document.getElementById('lote-prod').value,
        cod_fornecedor: parseInt(document.getElementById('lote-forn').value),
        quantidade: parseInt(document.getElementById('lote-qtd').value),
        preco_compra: parseFloat(document.getElementById('lote-preco').value),
        data_recebimento: document.getElementById('lote-data').value,
        data_validade: document.getElementById('lote-val').value
    };

    if(!payload.cod_produto || !payload.data_recebimento) return alert("Preencha os dados!");

    const res = await fetch('http://127.0.0.1:8000/lote', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
    });

    if(res.ok) { alert("Entrada registrada!"); carregarLotes(); }
    else { alert("Erro ao registrar entrada."); }
}

// CADASTRAR FORNECEDOR
async function cadastrarFornecedor() {
    const nome = document.getElementById('forn-nome').value;
    const data = document.getElementById('forn-data').value;

    if(!nome) return alert("Preencha o nome!");

    const res = await fetch('http://127.0.0.1:8000/fornecedor', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({nome_fornecedor: nome, data_contratacao: data})
    });

    if(res.ok) alert("Fornecedor cadastrado!");
    else alert("Erro ao cadastrar.");
}

// EXCLUIR
async function excluirLote(id) {
    if(!confirm("Confirma a exclusão deste lote?")) return;
    
    const res = await fetch(`http://127.0.0.1:8000/lote?cod_lote=${id}`, { method: 'DELETE' });
    
    if(res.ok) carregarLotes();
    else alert("Erro ao excluir (pode ter vendas vinculadas).");
}