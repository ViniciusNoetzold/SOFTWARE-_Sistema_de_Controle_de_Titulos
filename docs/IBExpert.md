# Manual Operacional: Cadastro e Manutenção via IBExpert
**Sistema de Controle de Títulos Mezzold — Firebird 2.5.9**

Este guia documenta o procedimento completo para conectar, consultar e realizar cadastros diretamente no banco de dados Firebird do cliente utilizando a ferramenta **IBExpert**.

---

## 1. Conectando ao Banco de Dados usando o Alias `[HANSEN]`

1. Abra o **IBExpert** (disponível na pasta `C:\Mezzold\bin\IBExpert.exe` ou `E:\mezzold-studios-CdT\Bin\IBExpert.exe`).
2. No menu superior, clique em **Database ➔ Register Database** (ou pressione `Shift + Alt + R`).
3. Preencha as configurações de conexão:
   - **Server:** `Local` (ou `Remote` com Host `127.0.0.1` ou IP do servidor da rede).
   - **Server Version:** `Firebird 2.5`.
   - **Database File:** `HANSEN` *(Não informe o caminho físico `C:\...`, informe apenas o Alias configurado no `aliases.conf`)*.
   - **User Name:** `SYSDBA`.
   - **Password:** `masterkey`.
   - **Charset:** `WIN1252` ou `ISO8859_1`.
   - **Client Library File:** Selecione a `fbclient.dll` localizada em `C:\Program Files\Firebird\Firebird_2_5\bin\fbclient.dll` ou `C:\Mezzold\bin\fbclient.dll`.
4. Clique em **Test Connection** para validar.
5. Após o teste bem-sucedido, clique em **Register**.
6. Dê dois cliques no banco registrado na árvore à esquerda para conectar.

---

## 2. Como Cadastrar e Editar Usuários na Tabela `USUARIOS`

### Opção A: Inserção Direta pelo Editor Visual de Tabela
1. Na árvore à esquerda, expanda **Tables** e clique duas vezes sobre a tabela **`USUARIOS`**.
2. Clique na aba **Data** (ou pressione `F5`).
3. Clique no botão **`+` (Insert Record)** na barra de ferramentas.
4. Preencha os campos:
   - `NOME`: Nome completo do operador/administrador.
   - `EMAIL`: E-mail corporativo (único).
   - `USERNAME`: Login de acesso ao sistema (único).
   - `SENHA_HASH`: Senha de acesso do usuário.
   - `PERFIL`: `ADMIN`, `OPERADOR` ou `FINANCEIRO`.
   - `ATIVO`: `1` (Ativo) ou `0` (Inativo).
5. Pressione o botão **Commit Transaction** (ícone de visto verde ou `Ctrl + Alt + C`) para gravar permanentemente.

### Opção B: Inserção via Script SQL Editor
1. Pressione `F12` no IBExpert para abrir o **SQL Editor**.
2. Cole o comando abaixo e clique em **Execute** (`F9`):
```sql
INSERT INTO USUARIOS (NOME, EMAIL, USERNAME, SENHA_HASH, PERFIL, ATIVO)
VALUES ('Novo Administrador', 'admin2@empresa.com.br', 'admin2', 'senha123', 'ADMIN', 1);

COMMIT;
```

---

## 3. Como Cadastrar Cheques Manualmente na Tabela `CHEQUES`

1. Abra o **SQL Editor** (`F12`).
2. Execute a instrução abaixo com os dados do cheque e o ID do usuário responsável pelo cadastro:
```sql
INSERT INTO CHEQUES (
  TITULAR, 
  NUMERO_CHEQUE, 
  BANCO, 
  AGENCIA, 
  CONTA, 
  VALOR, 
  TIPO, 
  STATUS, 
  DATA_EMISSAO, 
  DATA_VENCIMENTO, 
  CRIADO_POR
) VALUES (
  'Comércio de Alimentos LTDA',
  '000456',
  'Banco do Brasil (001)',
  '1234-5',
  '98765-4',
  8500.00,
  'RECEBIDO',
  'EM ABERTO',
  CURRENT_DATE,
  '2026-09-20',
  1 -- ID do usuário na tabela USUARIOS
);

COMMIT;
```

---

## 4. Consultas Úteis para Diagnóstico e Auditoria

### Visualizar todos os cheques com nome do usuário que cadastrou:
```sql
SELECT 
  c.ID,
  c.TITULAR,
  c.NUMERO_CHEQUE,
  c.VALOR,
  c.STATUS,
  c.DATA_VENCIMENTO,
  u.NOME AS USUARIO_RESPONSAVEL
FROM CHEQUES c
LEFT JOIN USUARIOS u ON c.CRIADO_POR = u.ID
ORDER BY c.DATA_VENCIMENTO ASC;
```

### Reindexar todas as tabelas do banco:
```sql
SET STATISTICS INDEX IDX_USUARIOS_USERNAME;
SET STATISTICS INDEX IDX_CHEQUES_VENCIMENTO;
SET STATISTICS INDEX IDX_TITULOS_VENCIMENTO;
COMMIT;
```
