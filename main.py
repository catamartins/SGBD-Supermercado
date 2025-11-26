from flask import Flask, render_template
from flask_cors import CORS

from rotas.produto import produto_bp
from rotas.relatorios import relatorios_bp
from rotas.estoque import estoque_bp
from rotas.vendas import venda_bp
from rotas.auth import auth_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(produto_bp)
app.register_blueprint(relatorios_bp)
app.register_blueprint(estoque_bp)
app.register_blueprint(venda_bp)
app.register_blueprint(auth_bp)


@app.route('/')
def root():
    return render_template('index.html')

@app.route('/pagina/home') 
def pagina_home():
    return render_template('home.html')

@app.route('/pagina/vendas')
def pagina_vendas():
    return render_template('vendas.html')

@app.route('/pagina/historico')
def pagina_historico():
    return render_template('historico.html')

@app.route('/pagina/estoque')
def pagina_estoque():
    return render_template('estoque.html')

@app.route('/pagina/funcionarios')
def pagina_funcionarios():
    return render_template('funcionarios.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)