document.addEventListener('DOMContentLoaded', () => {
    carregarDashboard();
});

async function carregarDashboard() {
    try {
        const resAtual = await fetch('http://127.0.0.1:8000/relatorios/balanco_financeiro');
        const dados = await resAtual.json();
        const fin = dados.analise_financeira;

        document.getElementById('val-vendas').innerText = `R$ ${fin.total_recebido_em_vendas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        document.getElementById('val-custos').innerText = `R$ ${fin.total_gasto_em_compras.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        
        const lucro = fin.lucro_bruto_operacional;
        const elLucro = document.getElementById('val-lucro');
        elLucro.innerText = `R$ ${lucro.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        elLucro.style.color = lucro >= 0 ? '#27ae60' : '#e74c3c';

        const resHist = await fetch('http://127.0.0.1:8000/relatorios/historico_anual');
        const historico = await resHist.json();
        
        atualizarListaEGrafico(historico);

    } catch (e) { console.error(e); }
}

function atualizarListaEGrafico(historico) {
    const lista = document.getElementById('lista-historico');
    if(lista) {
        lista.innerHTML = '';
        historico.forEach(h => {
            const cor = h.lucro >= 0 ? 'green' : 'red';
            lista.innerHTML += `<li style="padding:10px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
                <span>${h.mes}</span> <strong style="color:${cor}">R$ ${h.lucro.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </li>`;
        });
    }

    const ctx = document.getElementById('salesChart');
    if(ctx) {
        const meses = historico.map(h => h.mes).reverse();
        const lucros = historico.map(h => h.lucro).reverse();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Lucro Líquido',
                    data: lucros,
                    borderColor: '#2980b9',
                    backgroundColor: 'rgba(41, 128, 185, 0.2)',
                    fill: true
                }]
            }
        });
    }
}