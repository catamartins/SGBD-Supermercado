from flask import Flask, Blueprint, request, jsonify
from servicos.relatorios import RelatoriosDatabase

app = Flask(__name__)

relatorios_bp = Blueprint('relatorios', __name__)

@relatorios_bp.route('/relatorios/resumo_mensal_por_produto', methods=['GET'])
def get_resumo_mensal_por_produto():
    import datetime
    hoje = datetime.date.today()
    
    ano_str = request.args.get('ano', str(hoje.year))
    mes_str = request.args.get('mes', str(hoje.month))
    
    try:
        ano = int(ano_str)
        mes = int(mes_str)
        if mes < 1 or mes > 12:
             return jsonify({"erro": "Mês inválido (deve ser entre 1 e 12)."}), 400
    except ValueError:
        return jsonify({"erro": "O ano e o mês devem ser números inteiros válidos."}), 400
    
    relatorios_db = RelatoriosDatabase()
    
    resumo_produtos = relatorios_db.get_resumo_mensal_por_produto(ano, mes)

    if resumo_produtos:
        return jsonify({
            "mes": mes,
            "ano": ano,
            "resumo": resumo_produtos # Retorna a lista de resumos por produto
        }), 200
    else:
        return jsonify({"mensagem": f"Nenhuma movimentação de produto encontrada em {mes}/{ano}."}), 200

@relatorios_bp.route('/relatorios/movimentacao', methods=['GET'])
def get_relatorio_movimentacao():
    # O código é opcional. Se não for fornecido, será None.
    codigo = request.args.get('codigo')
    
    relatorios_db = RelatoriosDatabase()
    
    # Chama o método passando None ou o código
    relatorio = relatorios_db.get_relatorio_movimentacao(codigo)

    if relatorio:
        return jsonify({
            "titulo": "Movimentação Geral" if not codigo else f"Movimentação Produto {codigo}",
            "movimentacoes": relatorio
        }), 200
    else:
        mensagem = "Nenhuma movimentação encontrada."
        return jsonify({"mensagem": mensagem}), 200
    
@relatorios_bp.route('/relatorios/historico_precos', methods=['GET'])
def get_historico_precos():
    codigo = request.args.get('codigo')
    
    if not codigo:
        return jsonify({"erro": "O código do produto é obrigatório para o histórico de preços."}), 400
    
    relatorios_db = RelatoriosDatabase()
    
    historico = relatorios_db.get_historico_precos_fornecedor(codigo)

    if historico:
        return jsonify({
            "cod_barras": codigo,
            "historico": historico
        }), 200
    else:
        return jsonify({"mensagem": f"Nenhum histórico de preço encontrado nos últimos 3 meses para o produto {codigo}."}), 200
    
@relatorios_bp.route('/relatorios/balanco_mensal', methods=['GET'])
def get_balanco_mensal():
    import datetime
    hoje = datetime.date.today()
    
    ano_str = request.args.get('ano', str(hoje.year))
    mes_str = request.args.get('mes', str(hoje.month))
    
    try:
        ano = int(ano_str)
        mes = int(mes_str)
        if mes < 1 or mes > 12:
             return jsonify({"erro": "Mês inválido (deve ser entre 1 e 12)."}), 400
    except ValueError:
        return jsonify({"erro": "O ano e o mês devem ser números inteiros válidos."}), 400
    
    relatorios_db = RelatoriosDatabase()
    
    balanco = relatorios_db.get_balanco_financeiro_mensal(ano, mes)

    if balanco:
        return jsonify({
            "mes": mes,
            "ano": ano,
            "receita_total": balanco.get('receita_total'),
            "custo_mercadoria_vendida": balanco.get('custo_mercadoria_vendida'),
            "lucro_bruto": balanco.get('lucro_bruto')
        }), 200
    else:
        # Se nenhuma venda ocorreu, a consulta ainda deve retornar zeros (COALESCE).
        return jsonify({"mensagem": "Nenhum dado financeiro encontrado para o período."}), 200