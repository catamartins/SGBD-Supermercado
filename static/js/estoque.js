
document.addEventListener('DOMContentLoaded', function() {
    carregarFornecedores();
    carregarCategorias();
    limparFormularios();
})

function limparFormularios() {
    document.getElementById('lote-prod').value = '';
    document.getElementById('lote-forn').value = '';
    document.getElementById('lote-qtd').value = '';
    document.getElementById('lote-preco').value = '';
    document.getElementById('lote-data').value = '';
    document.getElementById('lote-val').value = '';
    
    document.getElementById('forn-nome').value = '';
    document.getElementById('forn-cod').value = '';
    document.getElementById('forn-data').value = '';
}

async function carregarLotes() {
    const res = await fetch('http://127.0.0.1:8000/estoque/lotes');
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

async function cadastrarLote() {
    const cod_produto_str = document.getElementById('lote-prod').value;
    const cod_fornecedor_str = document.getElementById('lote-forn').value;
    const quantidade_str = document.getElementById('lote-qtd').value;
    const preco_compra_str = document.getElementById('lote-preco').value;
    const data_recebimento_str = document.getElementById('lote-data').value;
    const data_validade_str = document.getElementById('lote-val').value;
    
    if (
        !cod_produto_str || !cod_fornecedor_str || !quantidade_str || 
        !preco_compra_str || !data_recebimento_str
    ) {
        return alert("Por favor, preencha todos os campos obrigatórios: Produto, Fornecedor, Quantidade, Preço e Data de Recebimento.");
    }

    const preco_compra = parsePreco(preco_compra_str);
    if (preco_compra === null) {
        return alert("Preço de Compra inválido. Use formato: 10.50 ou 10,50");
    }
    
    
    const payload = {
        cod_produto: cod_produto_str,
        cod_fornecedor: parseInt(cod_fornecedor_str),
        quantidade: parseInt(quantidade_str),
        preco_compra: parseFloat(preco_compra_str),
        data_recebimento: data_recebimento_str,
        data_validade: data_validade_str
    };

    if (isNaN(payload.cod_fornecedor) || isNaN(payload.quantidade) || isNaN(payload.preco_compra)) {
        return alert("Os campos ID Fornecedor, Quantidade e Preço de Compra devem ser números válidos.");
    }
    
    const res = await fetch('http://127.0.0.1:8000/lote', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
    });

    if(res.ok) { 
        alert("Entrada registrada!"); 
        limparFormularios();
        carregarLotes(); 
    } else { 
        alert("Erro ao registrar entrada. Verifique se o Código do Produto e o ID do Fornecedor existem no sistema."); 
    }
}

async function excluirLote(id) {
    if(!confirm("Excluir este lote?")) return;
    const res = await fetch(`http://127.0.0.1:8000/estoque/lote?cod_lote=${id}`, {method: 'DELETE'});
    if(res.ok) carregarLotes();
    else alert("Erro ao excluir.");
}

async function cadastrarFornecedor() {
    const nome = document.getElementById('forn-nome').value;
    const codigo = document.getElementById('forn-cod').value;
    const data = document.getElementById('forn-data').value;

    if(!nome) return alert("Preencha o nome!");
    if(!codigo) return alert("Preencha o CNPJ!");

    const res = await fetch('http://127.0.0.1:8000/fornecedor', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({nome_fornecedor: nome, cod_fornecedor: codigo, data_contratacao: data})
    });

    if(res.ok) {
        alert("Fornecedor cadastrado!");
        limparFormularios();
    }
    else alert("Erro ao cadastrar.");
}

async function carregarFornecedores() {
    try {
        const res = await fetch('http://127.0.0.1:8000/fornecedores');
        const fornecedores = await res.json();
        const select = document.getElementById('lote-forn');
        
        fornecedores.forEach(f => {
            const option = document.createElement('option');
            option.value = f.cod_fornecedor;
            option.textContent = f.nome_fornecedor;
            select.appendChild(option);
        });
    } catch (e) {
        console.error('Erro ao carregar fornecedores:', e);
    }
}


async function excluirLote(id) {
    if(!confirm("Confirma a exclusão deste lote?")) return;
    
    const res = await fetch(`http://127.0.0.1:8000/lote?cod_lote=${id}`, { method: 'DELETE' });
    
    if(res.ok) carregarLotes();
    else alert("Erro ao excluir (pode ter vendas vinculadas).");
}

function parsePreco(valor) {
    const normalizado = valor.trim().replace(',', '.');
    const preco = parseFloat(normalizado);
    
    if (isNaN(preco)) {
        return null;
    }
    
    return Math.round(preco * 100) / 100;
}


async function filtrarProdutosEmEstoque() {
    const descricao = document.getElementById('busca-descricao').value.trim(); 
    const categoria = document.getElementById('filtro-categoria').value.trim();
    
    const tbody = document.getElementById('produtos_em_estoque-body');
    tbody.innerHTML = '';
    
    let apiUrl = 'http://127.0.0.1:8000/produto/em_estoque';
    let params = []; 
    
    if (descricao) {
        params.push(`descricao=${encodeURIComponent(descricao)}`);
    }
    if (categoria) {
        params.push(`categoria=${encodeURIComponent(categoria)}`);
    }

    if (params.length > 0) {
        apiUrl += `?${params.join('&')}`;
    } else {
        tbody.innerHTML = '<tr><td colspan="5" align="center">Preencha a descrição ou selecione uma categoria.</td></tr>';
        return;
    }

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        if (res.ok) {
            data.forEach(produto => {
                let status = '';
                let statusColor = '';
                const qtd = produto.qtd_em_estoque || 0;
                const minimo = produto.estoque_minimo || 0;
                
                if (qtd < minimo) {
                    status = 'Crítico';
                    statusColor = '#ff4444'; 
                } else if (qtd <= minimo * 2) {
                    status = 'Baixo';
                    statusColor = '#ffaa00'; 
                } else {
                    status = 'Normal';
                    statusColor = '#44aa44';
                }
                
                tbody.innerHTML += `
                    <tr>
                        <td>${produto.cod_barras}</td>
                        <td>${produto.nome}</td>
                        <td>${produto.tipo_produto}</td>
                        <td>${produto.qtd_em_estoque}</td>
                        <td><span style="color: ${statusColor}; font-weight: bold;">● ${status}</span></td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="5" align="center">${data.erro}</td></tr>`;
        }
    } catch (e) {
        console.error("Erro na requisição:", e);
        tbody.innerHTML = '<tr><td colspan="5" align="center">Erro ao conectar com a API.</td></tr>';
    }
}



function toggleFilters() {
    const descricaoInput = document.getElementById('busca-descricao');
    const catogoriaSelect = document.getElementById('filtro-categoria');
    
    if (descricaoInput.value.trim() !== '') {
        catogoriaSelect.disabled = true;
        catogoriaSelect.value = ""; 
    } 
    else if (catogoriaSelect.value.trim() !== '') {
        descricaoInput.disabled = true;
        descricaoInput.value = ""; 
    }
    else {
        descricaoInput.disabled = false;
        catogoriaSelect.disabled = false;
    }
}


async function carregarCategorias() {
    try {
        const res = await fetch('http://127.0.0.1:8000/produto/categorias');
        const categorias = await res.json();
        const select = document.getElementById('filtro-categoria');
        
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.tipo_produto;
            option.textContent = cat.tipo_produto;
            select.appendChild(option);
        });
    } catch (e) {
        console.error('Erro ao carregar categorias:', e);
    }
}


async function cadastrarProduto() {
    const cod_barras = document.getElementById('prod-barras').value.trim();
    const nome = document.getElementById('prod-nome').value.trim();
    const tipo_produto = document.getElementById('prod-categoria').value.trim();
    const preco_venda_str = document.getElementById('prod-preco').value.trim();
    const estoque_minimo_str = document.getElementById('prod-estoque-min').value.trim();
    
    if (!cod_barras || !nome || !tipo_produto || !preco_venda_str || !estoque_minimo_str) {
        return alert("Preencha todos os campos obrigatórios!");
    }
    
    const preco_venda = parsePreco(preco_venda_str);
    if (preco_venda === null) {
        return alert("Preço de venda inválido. Use formato: 10.50 ou 10,50");
    }
    
    const estoque_minimo = parseInt(estoque_minimo_str);
    if (isNaN(estoque_minimo)) {
        return alert("Estoque mínimo deve ser um número válido.");
    }
    
    const payload = {
        cod_barras: cod_barras,
        nome: nome,
        tipo_produto: tipo_produto,
        preco_venda: preco_venda,
        estoque_minimo: estoque_minimo
    };
    
    try {
        const res = await fetch('http://127.0.0.1:8000/produto', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert("Produto cadastrado com sucesso!");
            document.getElementById('prod-barras').value = '';
            document.getElementById('prod-nome').value = '';
            document.getElementById('prod-categoria').value = '';
            document.getElementById('prod-preco').value = '';
            document.getElementById('prod-estoque-min').value = '';
            carregarCategorias(); 
        } else {
            const erro = await res.json();
            alert(`Erro: ${erro.erro || erro.mensagem || 'Erro ao cadastrar produto.'}`);
        }
    } catch (e) {
        console.error("Erro na requisição:", e);
        alert("Erro ao conectar com a API.");
    }
}