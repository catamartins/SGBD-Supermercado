from database.conector import DatabaseManager

class FuncionarioDatabase:

    def __init__(self, db_provider: DatabaseManager | None = None) -> None:
        # Avoid creating a DB connection at import time by lazy-initializing
        self.db = db_provider or DatabaseManager()
    
    def status_funcionario(self, cpf: str):
        """
        nome, salário e setor.
        """
        query = """
            SELECT 
                f.nome_completo,
                f.salario,
                s.nome_setor,
                f.cargo
            FROM 
                Funcionario f
            JOIN 
                Setor s ON f.cod_setor = s.cod_setor
            WHERE 
                f.cpf = %s;
        """
        params = (cpf,)
        
        # Usamos execute_select_one
        return self.db.execute_select_one(query, params)