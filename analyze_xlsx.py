import pandas as pd
import json

# Ler o arquivo XLSX
file_path = '/home/ubuntu/upload/[Nemu]Basededados.xlsx'

try:
    # Ler todas as abas do arquivo
    excel_file = pd.ExcelFile(file_path)
    print("Abas disponíveis:", excel_file.sheet_names)
    
    # Ler a primeira aba (ou especificar uma aba específica)
    df = pd.read_excel(file_path, sheet_name=0)
    
    print("\nInformações do DataFrame:")
    print(f"Número de linhas: {len(df)}")
    print(f"Número de colunas: {len(df.columns)}")
    
    print("\nColunas disponíveis:")
    for i, col in enumerate(df.columns):
        print(f"{i+1}. {col}")
    
    print("\nPrimeiras 5 linhas:")
    print(df.head())
    
    print("\nTipos de dados:")
    print(df.dtypes)
    
    print("\nInformações sobre valores nulos:")
    print(df.isnull().sum())
    
    # Verificar se os campos obrigatórios estão presentes
    required_fields = ['sessionId', 'channel', 'created_at', 'campaign', 'medium', 'content']
    missing_fields = []
    
    for field in required_fields:
        if field not in df.columns:
            # Tentar encontrar campos similares
            similar_fields = [col for col in df.columns if field.lower() in col.lower()]
            if similar_fields:
                print(f"\nCampo '{field}' não encontrado, mas encontrados campos similares: {similar_fields}")
            else:
                missing_fields.append(field)
    
    if missing_fields:
        print(f"\nCampos obrigatórios não encontrados: {missing_fields}")
    else:
        print("\nTodos os campos obrigatórios estão presentes!")
    
    # Salvar uma amostra dos dados em JSON para análise
    sample_data = df.head(10).to_dict('records')
    with open('/home/ubuntu/sample_data.json', 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, indent=2, default=str)
    
    print("\nAmostra dos dados salva em sample_data.json")
    
except Exception as e:
    print(f"Erro ao ler o arquivo: {e}")

