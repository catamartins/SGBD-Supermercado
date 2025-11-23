from database.conector import DatabaseManager

class VendaDatabase:
    def __init__(self, db_provider = None):
        self.db = db_provider or DatabaseManager()

    def registrar_venda(self, dados_venda):
        """
        Recebe o objeto de venda completo e grava no banco.
        1. Insere na tabela Venda.
        2. Insere os itens na tabela Venda_Contem_Produto.
        """
        
        # 1. Inserir a VENDA (Cabeçalho)
        query_venda = """
            INSERT INTO Venda (
                cod_venda, 
                data_venda, 
                cpf_funcionario, 
                valor_total, 
                forma_pagamento, 
                parcelas, 
                desconto
            ) VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        params_venda = (
            dados_venda['codigo_venda'],
            dados_venda['data_venda'],
            dados_venda['cpf_funcionario'],
            dados_venda['valor_total'],
            dados_venda['forma_pagamento'],
            dados_venda['parcelas'],
            dados_venda.get('desconto', 0)
        )
        
        # Tenta gravar a venda
        if not self.db.execute_statement(query_venda, params_venda):
            return False # Falha ao gravar a venda

        # 2. Inserir os ITENS (Loop pelos produtos do carrinho)
        query_item = """
            INSERT INTO Venda_Contem_Produto (
                cod_venda, 
                cod_barras, 
                quantidade, 
                preco_unitario
            ) VALUES (%s, %s, %s, %s);
        """
        
        # Para cada item na lista 'itens' do JSON...
        for item in dados_venda['itens']:
            params_item = (
                dados_venda['codigo_venda'], # Chave estrangeira ligando à venda
                item['cod_produto'],
                item['quantidade'],
                item['preco_unitario']
            )
            # Se falhar ao gravar um item, o ideal seria cancelar tudo (rollback),
            # mas na estrutura atual, retornaremos False para sinalizar erro.
            if not self.db.execute_statement(query_item, params_item):
                print(f"Erro ao gravar item: {item['cod_produto']}")
                return False

        return True