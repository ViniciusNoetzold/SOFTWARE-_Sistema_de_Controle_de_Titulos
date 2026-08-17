# 🏢 Mezzold Financial — Sistema de Controle de Títulos & Custódia

Sistema executivo para gestão de duplicatas, contas a receber, contas a pagar, custódia e rastreamento de cheques, geração de cobrança PIX com QR Code, emissão de Borderô em folha A4 timbrada e integração nativa com o banco de dados **Firebird 2.5.9**.

---

## 🚀 1. Visão Geral da Arquitetura

O sistema é construído sobre uma arquitetura híbrida de alto desempenho:
- **Frontend & UI Executiva:** React 19 + TypeScript + Tailwind CSS com design tokens corporativos em *Dark Slate & Sapphire Blue*.
- **Desktop Wrapper:** Tauri / Node Server embutido para execução local com suporte offline e acesso à rede local do cliente.
- **Banco de Dados Relacional:** **Firebird 2.5.9** conectado através do alias oficial `[HANSEN]`.

---

## 📂 2. Estrutura de Diretórios no Cliente (`C:\Mezzold`)

O instalador automático organiza o disco do cliente na seguinte estrutura:

```text
C:\Mezzold\
├── bin\                     # Executáveis, IBExpert, IBEScript e fbclient.dll
├── dados\                   # Banco de dados Firebird (ESTOQUE.FDB)
├── logs\                    # Logs de auditoria e atividades
├── config\                  # Aliases, arquivos de configuração e schema SQL
└── app\                     # Binários da aplicação compilada (.exe / assets)
```

---

## ⚙️ 3. Instalação Automática do Ambiente e Firebird 2.5.9

Para configurar um novo servidor ou máquina cliente:

1. Execute o instalador automático como **Administrador**:
   ```cmd
   install_mezzold_environment.bat
   ```
2. O instalador executa silenciosamente:
   - Criação da pasta `C:\Mezzold` e todas as subpastas.
   - Instalação silenciosa do servidor **Firebird 2.5.9**.
   - Configuração automática do `aliases.conf` com o alias:
     ```ini
     HANSEN = C:\Mezzold\dados\ESTOQUE.FDB
     AliasCEP = LOCALHOST:HCEP
     ```
   - Cópia da `fbclient.dll` e utilitários para `C:\Mezzold\bin\`.

---

## 🛠️ 4. Gestão e Cadastro via IBExpert

Para instruções detalhadas passo a passo de como registrar o banco, cadastrar usuários administradores e auditar cheques manualmente no IBExpert, consulte o guia oficial:
📖 **[Manual do IBExpert (docs/IBExpert.md)](docs/IBExpert.md)**

### Conexão Rápida no IBExpert:
- **Server:** `Local` (ou IP da rede)
- **Database:** `HANSEN` *(usar o Alias oficial)*
- **User / Password:** `SYSDBA` / `masterkey`
- **Charset:** `WIN1252`
- **Client Library:** `C:\Mezzold\bin\fbclient.dll`

---

## 💻 5. Compilação e Geração do Executável (.exe)

### Requisitos:
- Node.js 20+ e npm
- Rust & Tauri CLI (ou empacotamento web desktop)

### Comandos de Compilação:
```bash
# 1. Instalar dependências
npm install

# 2. Executar verificação de tipos
npm run lint

# 3. Compilar frontend otimizado
npm run build

# 4. Iniciar em modo desenvolvimento
npm run dev
```

---

## 🔐 6. Usuários Padrão & Segurança

| Usuário | Perfil | Senha Padrão | Observação |
|---|---|---|---|
| `000` | Mestre Mezzold | `M3zz0ld` | Usuário exclusivo da Mezzold com acesso ao Painel de Licença |
| `admin` | Administrador | `admin123` | Gestor financeiro do cliente |
| `operador` | Operador | `operador123` | Lançamentos e consultas diárias |
| `carlos` | Financeiro | `carlos123` | Emissão de borderôs e baixas |
