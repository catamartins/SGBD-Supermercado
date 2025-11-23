from database.conector import DatabaseManager

class RelatoriosDatabase:

    def __init__(self, db_provider = None):
        self.db = db_provider or DatabaseManager()

    # --- MÉTODOS DE LEITURA (SELECT) ---
    def get_resumo_mensal_por_produto(self, ano: int, mes: int):
        query = """
            WITH Movimentacao AS (
                SELECT l.cod_produto AS cod_barras, p.nome AS nome_produto, l.quantidade AS entrada, 0 AS saida
                FROM Lote l JOIN Produto p ON l.cod_produto = p.cod_barras
                WHERE EXTRACT(YEAR FROM data_recebimento) = %s AND EXTRACT(MONTH FROM data_recebimento) = %s
                UNION ALL
                SELECT vcp.cod_barras, p.nome AS nome_produto, 0 AS entrada, vcp.quantidade AS saida
                FROM Venda_Contem_Produto vcp JOIN Venda v ON vcp.cod_venda = v.cod_venda JOIN Produto p ON vcp.cod_barras = p.cod_barras
                WHERE EXTRACT(YEAR FROM v.data_venda) = %s AND EXTRACT(MONTH FROM v.data_venda) = %s
            )
            SELECT cod_barras, nome_produto, SUM(entrada) AS total_entradas, SUM(saida) AS total_saidas
            FROM Movimentacao GROUP BY cod_barras, nome_produto ORDER BY nome_produto ASC;
        """
        return self.db.execute_select_all(query, (ano, mes, ano, mes))

    def get_relatorio_movimentacao(self, cod_barras=None):
        where_clause = "WHERE l.cod_produto = %s" if cod_barras else ""
        where_clause_venda = "WHERE vcp.cod_barras = %s" if cod_barras else ""
        params = (cod_barras, cod_barras) if cod_barras else ()

        query = f"""
            SELECT 'ENTRADA' AS tipo_movimento, l.data_recebimento AS data_movimento, l.quantidade, CAST(l.cod_lote AS VARCHAR) AS referencia, l.cod_produto, p.nome AS nome_produto
            FROM Lote l JOIN Produto p ON l.cod_produto = p.cod_barras {where_clause}
            UNION ALL
            SELECT 'SAÍDA' AS tipo_movimento, v.data_venda AS data_movimento, (vcp.quantidade * -1) AS quantidade, CAST(vcp.cod_venda AS VARCHAR) AS referencia, vcp.cod_barras AS cod_produto, p.nome AS nome_produto
            FROM Venda_Contem_Produto vcp JOIN Venda v ON vcp.cod_venda = v.cod_venda JOIN Produto p ON vcp.cod_barras = p.cod_barras {where_clause_venda}
            ORDER BY data_movimento DESC;
        """
        return self.db.execute_select_all(query, params)

    def get_historico_precos_lotes(self, cod_barras=None):
        query = """
            SELECT p.nome AS nome_produto, l.cod_lote, l.data_recebimento, l.preco_compra, l.quantidade
            FROM Lote l JOIN Produto p ON l.cod_produto = p.cod_barras
            WHERE l.data_recebimento >= CURRENT_DATE - INTERVAL '3 months'
        """
        params = []
        if cod_barras:
            query += " AND l.cod_produto = %s"
            params.append(cod_barras)
        query += " ORDER BY l.data_recebimento DESC;"
        return self.db.execute_select_all(query, tuple(params))

    def get_balanco_financeiro_mensal(self, ano: int, mes: int):
        query = """
            SELECT
                (SELECT COALESCE(SUM(l.quantidade * l.preco_compra), 0) FROM Lote l WHERE EXTRACT(YEAR FROM l.data_recebimento) = %s AND EXTRACT(MONTH FROM l.data_recebimento) = %s) AS total_custos,
                (SELECT COALESCE(SUM(vcp.quantidade * p.preco_venda), 0) FROM Venda_Contem_Produto vcp JOIN Venda v ON vcp.cod_venda = v.cod_venda JOIN Produto p ON vcp.cod_barras = p.cod_barras WHERE EXTRACT(YEAR FROM v.data_venda) = %s AND EXTRACT(MONTH FROM v.data_venda) = %s) AS total_faturamento;
        """
        return self.db.execute_select_one(query, (ano, mes, ano, mes))

    def get_funcionario_por_cpf(self, cpf: str):
        query = "SELECT cpf, nome_completo, cod_setor, cargo, salario, genero, endereco FROM Funcionario WHERE cpf = %s;"
        return self.db.execute_select_one(query, (cpf,))

    # --- MÉTODOS DE ESCRITA (INSERT / DELETE) ---
    def criar_funcionario(self, dados):
        query = "INSERT INTO Funcionario (cpf, nome_completo, cod_setor, cargo, genero, endereco, salario) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        params = (dados['cpf'], dados['nome_completo'], dados['cod_setor'], dados['cargo'], dados.get('genero'), dados.get('endereco'), dados['salario'])
        return self.db.execute_statement(query, params)

    def deletar_funcionario(self, cpf: str):
        """
        Remove um funcionário pelo CPF.
        """
        query = "DELETE FROM Funcionario WHERE cpf = %s;"
        return self.db.execute_statement(query, (cpf,))