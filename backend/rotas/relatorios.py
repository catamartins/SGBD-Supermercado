from flask import Flask, Blueprint, request, jsonify
from servicos.relatorios import RelatoriosDatabase
import datetime

relatorios_bp = Blueprint('relatorios', __name__)

# --- ROTAS DE LEITURA ---
@relatorios_bp.route('/relatorios/resumo_mensal_por_produto', methods=['GET'])
def get_resumo_mensal_por_produto():
    hoje = datetime.date.today()
    ano = int(request.args.get('ano', str(hoje.year)))
    mes = int(request.args.get('mes', str(hoje.month)))
    
    resumo = RelatoriosDatabase().get_resumo_mensal_por_produto(ano, mes)
    return jsonify({"mes": mes, "ano": ano, "resumo": resumo}) if resumo else jsonify({"mensagem": "Sem dados."})

@relatorios_bp.route('/relatorios/movimentacao', methods=['GET'])
def get_relatorio_movimentacao():
    codigo = request.args.get('codigo')
    relatorio = RelatoriosDatabase().get_relatorio_movimentacao(codigo)
    return jsonify({"movimentacoes": relatorio}) if relatorio else jsonify({"mensagem": "Sem dados."})

@relatorios_bp.route('/relatorios/historico_precos', methods=['GET'])
def get_historico_precos():
    codigo = request.args.get('codigo')
    historico = RelatoriosDatabase().get_historico_precos_lotes(codigo)
    return jsonify({"historico": historico}) if historico else jsonify({"mensagem": "Sem dados."})

@relatorios_bp.route('/relatorios/balanco_financeiro', methods=['GET'])
def get_balanco_financeiro():
    hoje = datetime.date.today()
    ano = int(request.args.get('ano', str(hoje.year)))
    mes = int(request.args.get('mes', str(hoje.month)))
    
    dados = RelatoriosDatabase().get_balanco_financeiro_mensal(ano, mes)
    if dados:
        custos = float(dados.get('total_custos', 0))
        fat = float(dados.get('total_faturamento', 0))
        return jsonify({"analise_financeira": {"custos": custos, "faturamento": fat, "lucro": fat - custos, "situacao": "LUCRO" if (fat-custos) >= 0 else "PREJUÍZO"}})
    return jsonify({"erro": "Erro ao calcular."}), 500

# --- ROTAS DE FUNCIONÁRIO (GET, POST, DELETE) ---
@relatorios_bp.route('/funcionario', methods=['GET'])
def get_funcionario():
    cpf = request.args.get('cpf')
    if not cpf: return jsonify({"erro": "CPF obrigatório."}), 400
    
    func = RelatoriosDatabase().get_funcionario_por_cpf(cpf)
    if func:
        # Conversão de Decimal para float
        func['salario'] = float(func['salario']) if func['salario'] else 0.0
        return jsonify(func)
    return jsonify({"mensagem": "Não encontrado."}), 404

@relatorios_bp.route('/funcionario', methods=['POST'])
def criar_funcionario():
    dados = request.get_json()
    if RelatoriosDatabase().criar_funcionario(dados):
        return jsonify({"mensagem": "Criado com sucesso!"}), 201
    return jsonify({"erro": "Erro ao criar."}), 500

@relatorios_bp.route('/funcionario', methods=['DELETE'])
def deletar_funcionario():
    cpf = request.args.get('cpf')
    if not cpf:
        return jsonify({"erro": "O parâmetro 'cpf' é obrigatório para exclusão."}), 400

    if RelatoriosDatabase().deletar_funcionario(cpf):
        return jsonify({"mensagem": f"Funcionário {cpf} removido com sucesso!"}), 200
    else:
        return jsonify({"erro": "Erro ao remover. Verifique se o funcionário possui vendas vinculadas."}), 500