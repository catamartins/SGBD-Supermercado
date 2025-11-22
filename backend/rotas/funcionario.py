from flask import Flask, Blueprint, request, jsonify
from servicos.funcionario import FuncionarioDatabase

app = Flask(__name__)

funcionario_bp = Blueprint('funcionario', __name__)

@funcionario_bp.route('/funcionario/status_funcionario', methods=['GET'])
def status_funcionario():
    
    cpf = request.args.get('cpf')
    
    if not cpf:
        return jsonify({"erro": "O CPF do funcionário é obrigatório."}), 400
    
    relatorios_db = FuncionarioDatabase()
    
    status = relatorios_db.status_funcionario(cpf)

    if status:
        return jsonify({
            "status_funcionario": {
                "nome": status.get('nome_completo'),
                "cargo": status.get('cargo'),
                "setor": status.get('nome_setor'),
                "salario_base": status.get('salario')
            }
        }), 200
    else:
        return jsonify({"mensagem": f"Funcionário com CPF {cpf} não encontrado."}), 404