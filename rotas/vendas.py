from flask import Flask, Blueprint, request, jsonify
from servicos.vendas import VendaDatabase

venda_bp = Blueprint('venda', __name__)

@venda_bp.route('/venda', methods=['POST'])
def registrar_venda():
    dados = request.get_json()
    
    # 1. Validação Básica dos Dados
    if not dados:
        return jsonify({"erro": "Nenhum dado enviado."}), 400
        
    campos_obrigatorios = ['codigo_venda', 'cpf_funcionario', 'valor_total', 'itens']
    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({"erro": f"O campo '{campo}' é obrigatório."}), 400

    if not dados['itens'] or len(dados['itens']) == 0:
        return jsonify({"erro": "A venda deve conter pelo menos um item."}), 400

    # 2. Processamento
    venda_db = VendaDatabase()
    sucesso = venda_db.registrar_venda(dados)

    if sucesso:
        return jsonify({
            "mensagem": "Venda registrada com sucesso!",
            "codigo_venda": dados['codigo_venda']
        }), 201
    else:
        return jsonify({"erro": "Erro ao registrar venda. Verifique se o código já existe ou se os produtos são válidos."}), 500