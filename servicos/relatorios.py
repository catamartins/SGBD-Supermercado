from database.conector import DatabaseManager
import datetime

class RelatoriosDatabase:
    def __init__(self, db_provider = None):
        self.db = db_provider or DatabaseManager()

    # --- DASHBOARD ---
    def get_balanco_financeiro_mensal(self, ano: int, mes: int):
        # Calcula custos (Lotes recebidos no mês) e faturamento (Vendas no mês)
        query = """
            SELECT
                (SELECT COALESCE(SUM(l.quantidade * l.preco_compra), 0) 
                 FROM Lote l 
                 WHERE EXTRACT(YEAR FROM l.data_recebimento) = %s AND EXTRACT(MONTH FROM l.data_recebimento) = %s
                ) AS total_custos,
                (SELECT COALESCE(SUM(v.valor_total), 0) 
                 FROM Venda v 
                 WHERE EXTRACT(YEAR FROM v.data_venda) = %s AND EXTRACT(MONTH FROM v.data_venda) = %s
                ) AS total_faturamento;
        """
        return self.db.execute_select_one(query, (ano, mes, ano, mes))

    def get_historico_anual(self):
        # Gera dados dos últimos 6 meses para o gráfico e lista
        hoje = datetime.date.today()
        historico = []
        
        for i in range(6):
            mes_calc = hoje.month - i
            ano_calc = hoje.year
            if mes_calc <= 0:
                mes_calc += 12
                ano_calc -= 1
            
            dados = self.get_balanco_financeiro_mensal(ano_calc, mes_calc)
            faturamento = float(dados['total_faturamento'])
            custos = float(dados['total_custos'])
            
            historico.append({
                "mes": f"{mes_calc}/{ano_calc}",
                "faturamento": faturamento,
                "custos": custos,
                "lucro": faturamento - custos
            })
        return historico

    # --- ESTOQUE (Lista completa) ---
    def get_todos_lotes(self):
        query = """
            SELECT p.cod_barras, l.cod_lote, p.nome as produto, f.nome_fornecedor, l.quantidade, l.data_validade
            -- SELECT l.cod_lote, p.nome as produto, f.nome_fornecedor, l.quantidade, l.data_validade
            FROM Lote l
            JOIN Produto p ON l.cod_produto = p.cod_barras
            JOIN Fornecedor f ON l.cod_fornecedor = f.cod_fornecedor
            ORDER BY l.data_recebimento DESC;
        """
        return self.db.execute_select_all(query)

    def deletar_lote(self, cod_lote):
        return self.db.execute_statement("DELETE FROM Lote WHERE cod_lote = %s", (cod_lote,))

    # --- FUNCIONÁRIOS (Gestão Unificada) ---
    def get_funcionario_por_cpf(self, cpf):
        query = """
            SELECT f.nome_completo, f.cargo, s.nome_setor as setor, f.salario, f.cpf 
            FROM Funcionario f
            JOIN Setor s ON f.cod_setor = s.cod_setor
            WHERE f.cpf = %s
        """
        return self.db.execute_select_one(query, (cpf,))

    def criar_funcionario(self, dados):
        query = "INSERT INTO Funcionario (cpf, nome_completo, cod_setor, cargo, genero, endereco, salario) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        params = (dados['cpf'], dados['nome_completo'], dados['cod_setor'], dados['cargo'], dados['genero'], dados['endereco'], dados['salario'])
        return self.db.execute_statement(query, params)

    def deletar_funcionario(self, cpf):
        # Primeiro remove usuário de login se existir, depois o funcionário
        self.db.execute_statement("DELETE FROM Usuario WHERE cpf_funcionario = %s", (cpf,))
        return self.db.execute_statement("DELETE FROM Funcionario WHERE cpf = %s", (cpf,))