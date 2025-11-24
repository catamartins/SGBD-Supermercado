from database.conector import DatabaseManager

class VendaDatabase:
    def __init__(self, db_provider = None):
        self.db = db_provider or DatabaseManager()

    def registrar_venda(self, dados_venda):
        """
        Registra a venda deixando o Banco de Dados gerar o ID (Serial).
        """
        try:
            # 1. Inserir a VENDA (Cabeçalho) e RECUPERAR o ID gerado
            # Note o "RETURNING cod_venda" no final da query
            query_venda = """
                INSERT INTO Venda (
                    data_venda, 
                    cpf_funcionario, 
                    valor_total, 
                    forma_pagamento, 
                    qntd_parcelas,   
                    valor_desconto   
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING cod_venda;
            """
            
            # Monta os dados. 
            # IMPORTANTE: Não passamos mais o 'codigo_venda' aqui.
            params_venda = (    
                dados_venda['data_venda'],
                dados_venda['cpf_funcionario'],
                dados_venda['valor_total'],
                dados_venda['forma_pagamento'],
                dados_venda['parcelas'],      # O JS manda 'parcelas', gravamos em 'qntd_parcelas'
                dados_venda.get('desconto', 0) 
            )
            
            # Executamos diretamente no cursor para poder pegar o retorno (ID)
            self.db.cursor.execute(query_venda, params_venda)
            
            # Pega o ID que o banco acabou de criar
            cod_venda_gerado = self.db.cursor.fetchone()[0]
            
            # 2. Inserir os ITENS usando o ID gerado
            query_item = """
                INSERT INTO Venda_Contem_Produto (
                    cod_venda, 
                    cod_barras, 
                    quantidade
                ) VALUES (%s, %s, %s);
            """
            
            for item in dados_venda['itens']:
                params_item = (
                    cod_venda_gerado,    # Usamos o ID que pegamos do banco acima
                    item['cod_produto'],
                    item['quantidade']
                )
                self.db.cursor.execute(query_item, params_item)

            # Se tudo deu certo até aqui, confirmamos a transação (Commit)
            self.db.conn.commit()
            print(f"Venda {cod_venda_gerado} registrada com sucesso!")
            return True

        # except Exception as e:
        #     # Se der qualquer erro, desfaz tudo (Rollback)
        #     self.db.conn.rollback()
        #     print(f"\n!!! ERRO AO GRAVAR VENDA !!!")
        #     print(f"Detalhe: {e}")
            
        #     self.db.conn.commit()
        #     print(f"Venda {cod_venda_gerado} registrada com sucesso!")
            
        #     # ALTERAÇÃO AQUI: Retorna o ID gerado em vez de apenas True
        #     return cod_venda_gerado 

        except Exception as e:
            self.db.conn.rollback()
            print(f"\n!!! ERRO AO GRAVAR VENDA !!!")
            print(f"Detalhe: {e}")
            return None # Retorna None em caso de erro