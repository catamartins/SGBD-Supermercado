from flask import Flask, Blueprint, request, jsonify
from servicos.vendas import VendaDatabase

venda_bp = Blueprint('venda', __name__)

@venda_bp.route('/venda', methods=['POST'])
def registrar_venda():
    dados = request.get_json()
    
    if not dados:
        return jsonify({"erro": "Nenhum dado enviado."}), 400
        
    campos_obrigatorios = ['cpf_funcionario', 'valor_total', 'itens']
    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({"erro": f"O campo '{campo}' é obrigatório."}), 400

    if not dados['itens'] or len(dados['itens']) == 0:
        return jsonify({"erro": "A venda deve conter pelo menos um item."}), 400

    venda_db = VendaDatabase()
   
    id_venda_gerado = venda_db.registrar_venda(dados)

    if id_venda_gerado:
        return jsonify({
            "mensagem": "Venda registrada com sucesso!",
            "codigo_venda": id_venda_gerado  
        }), 201
    else:
        return jsonify({"erro": "Erro ao registrar venda"}), 500
    