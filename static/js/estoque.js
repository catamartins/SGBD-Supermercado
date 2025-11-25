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
                <td>${l.cod_barras}</td>
                <td>LOTE-${l.cod_lote}</td>
                <td>${l.quantidade}</td>
                <td>${new Date(l.data_validade).toLocaleDateString()}</td>
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
    // 1. Coleta os valores do DOM (como strings)
    const cod_produto_str = document.getElementById('lote-prod').value;
    const cod_fornecedor_str = document.getElementById('lote-forn').value;
    const quantidade_str = document.getElementById('lote-qtd').value;
    const preco_compra_str = document.getElementById('lote-preco').value;
    const data_recebimento_str = document.getElementById('lote-data').value;
    const data_validade_str = document.getElementById('lote-val').value;
    
    // 2. Validação de Preenchimento: Checa se os campos críticos não estão vazios
    if (
        !cod_produto_str || !cod_fornecedor_str || !quantidade_str || 
        !preco_compra_str || !data_recebimento_str
        // data_validade pode ser nula, dependendo da sua DDL, por isso não a validamos aqui
    ) {
        return alert("Por favor, preencha todos os campos obrigatórios: Produto, Fornecedor, Quantidade, Preço e Data de Recebimento.");
    }
    
    // 3. Monta o Payload, aplicando as conversões *depois* de saber que as strings não são vazias
    const payload = {
        cod_produto: cod_produto_str,
        cod_fornecedor: parseInt(cod_fornecedor_str),
        quantidade: parseInt(quantidade_str),
        preco_compra: parseFloat(preco_compra_str),
        data_recebimento: data_recebimento_str,
        data_validade: data_validade_str
    };

    // 4. Checagem de Erro de Conversão (garante que não enviamos NaN)
    if (isNaN(payload.cod_fornecedor) || isNaN(payload.quantidade) || isNaN(payload.preco_compra)) {
        return alert("Os campos ID Fornecedor, Quantidade e Preço de Compra devem ser números válidos.");
    }
    
    // 5. Chamada API
    const res = await fetch('http://127.0.0.1:8000/lote', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
    });

    if(res.ok) { 
        alert("Entrada registrada!"); 
        carregarLotes(); 
    } else { 
        // A mensagem de erro sugere o erro de FK
        alert("Erro ao registrar entrada. Verifique se o Código do Produto e o ID do Fornecedor existem no sistema."); 
    }
}

// // Teste (stefanie)
// //CADASTRAR LOTE
// async function cadastrarLote() {
//     const payload = {
//         cod_produto: document.getElementById('lote-prod').value,
//         cod_fornecedor: parseInt(document.getElementById('lote-forn').value),
//         quantidade: parseInt(document.getElementById('lote-qtd').value),
//         preco_compra: parseFloat(document.getElementById('lote-preco').value),
//         data_recebimento: document.getElementById('lote-data').value,
//         data_validade: document.getElementById('lote-val').value
//     };

//     if(!payload.cod_produto || !payload.data_recebimento) return alert("Preencha os dados!");

//     const res = await fetch('http://127.0.0.1:8000/lote', {
//         method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
//     });

//     if(res.ok) { alert("Entrada registrada!"); carregarLotes(); }
//     else { alert("Erro ao registrar entrada."); }
// }

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