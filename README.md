# 🏢 Mezzold Financial — Sistema de Controle de Títulos & Custódia

Sistema executivo de alta performance para controle de duplicatas, contas a receber, contas a pagar, custódia e rastreamento de cheques, central de cobrança com geração de PIX EMV® (QR Code e Copia e Cola), emissão de Borderô em folha A4 timbrada e integração nativa com o banco de dados **Firebird 2.5.9**.

---

## 🚀 1. Visão Geral da Arquitetura & Auto-Provisionamento

O sistema foi desenhado com foco em **Zero-Configuration** no cliente:
- **Auto-Criação de Pastas e Ambiente:** O instalador (`install_mezzold_environment.bat`) e a aplicação criam de forma 100% autônoma todos os diretórios, arquivos de log, configurações locais e permissões de disco.
- **Frontend & UI Executiva:** React 19 + TypeScript + Tailwind CSS com suporte a 5 paletas de temas visuais em tempo real (*Azul Safira, Grafite Neutro, Esmeralda Banking, Ruby Mezzold e Modo Claro*).
- **Desktop Wrapper:** Tauri v2 / Node Server embutido para execução como `.exe` no Windows com suporte offline e acesso à rede local do cliente.
- **Banco de Dados Relacional:** **Firebird 2.5.9** conectado através do alias oficial `[HANSEN]`.

---

## 🗄️ 2. Banco de Dados Firebird 2.5.9 & Conexões

### 📌 Parâmetros Oficiais de Conexão:
| Parâmetro | Valor Padrão | Descrição |
|---|---|---|
| **Driver / Protocolo** | `TCP/IP` (Porta `3050`) | Protocolo nativo de alta velocidade do Firebird |
| **Servidor (Server)** | `127.0.0.1` ou `localhost` | IP local ou IP do servidor da rede |
| **Alias Oficial** | `HANSEN` | Aponta internamente para `C:\Mezzold\dados\ESTOQUE.FDB` |
| **Caminho Físico do Banco** | `C:\Mezzold\dados\ESTOQUE.FDB` | Arquivo físico do banco de dados relacional |
| **Usuário Administrativo** | `SYSDBA` | Usuário administrador nativo do Firebird |
| **Senha Padrão** | `masterkey` | Senha padrão do servidor Firebird |
| **Charset / Character Set** | `WIN1252` (ou `ISO8859_1`) | Suporte perfeito à acentuação em Português-BR |
| **Client Library** | `fbclient.dll` (ou `gds32.dll`) | Biblioteca nativa de 32/64 bits em `C:\Mezzold\bin\` |

---

## 📂 3. Estrutura Automática de Diretórios (`C:\Mezzold`)

Ao rodar o instalador na máquina do cliente, a estrutura de diretórios é provisionada automaticamente:

```text
C:\Mezzold\
├── bin\                     # Executáveis de suporte, IBExpert, IBEScript e fbclient.dll
├── dados\                   # Banco de dados Firebird (ESTOQUE.FDB)
├── logs\                    # Logs de auditoria, conexões e diagnósticos do sistema
├── config\                  # Aliases do Firebird, arquivos de configuração e scripts SQL
└── app\                     # Binários da aplicação compilada (.exe / assets)
```

> **Nota de Autonomia:** Caso alguma pasta não exista na primeira inicialização, o instalador e o lançador criam as pastas faltantes automaticamente sem interromper a execução do usuário.

---

## ⚙️ 4. Instalação do Ambiente em 1 Clique

Para configurar um novo servidor ou máquina cliente:

1. Execute o instalador automático como **Administrador**:
   ```cmd
   install_mezzold_environment.bat
   ```
2. O instalador executa silenciosamente em segundo plano:
   - Criação automática da pasta `C:\Mezzold` e todas as subpastas (`bin`, `dados`, `logs`, `config`, `app`).
   - Instalação silenciosa do servidor **Firebird 2.5.9 x64** com serviço Windows configurado para inicialização automática.
   - Registro automático no `aliases.conf` do Firebird:
     ```ini
     HANSEN = C:\Mezzold\dados\ESTOQUE.FDB
     AliasCEP = LOCALHOST:HCEP
     ```
   - Cópia da `fbclient.dll` e do utilitário `IBExpert` para `C:\Mezzold\bin\`.
   - Liberação automática da porta `3050` no Firewall do Windows.

---

## 🛠️ 5. Ferramenta de Gestão do Banco: IBExpert

O pacote já acompanha o **IBExpert** pré-configurado para manutenções ou auditorias diretas no banco de dados.

📖 **Guia Completo:** Consulte o documento [Manual do IBExpert (docs/IBExpert.md)](docs/IBExpert.md).

### Registro do Banco no IBExpert:
1. Abra o `IBExpert.exe` localizado em `C:\Mezzold\bin\IBExpert.exe`.
2. Em **Database ➔ Register Database**:
   - **Server Type:** `Remote` (ou `Local`)
   - **Server:** `127.0.0.1` (Porta `3050`)
   - **Database File:** `HANSEN` *(Usar o nome do alias)*
   - **User Name:** `SYSDBA`
   - **Password:** `masterkey`
   - **Charset:** `WIN1252`
   - **Client Library File:** `C:\Mezzold\bin\fbclient.dll`
3. Clique em **Register** e conecte (`Ctrl + F2`).

---

## 🔐 6. Inicialização Limpa & Credenciais Iniciais

A aplicação inicia **100% zerada** (sem dados de demonstração ou títulos fictícios), permitindo que o cliente comece do absoluto zero:

| Usuário | Perfil | Senha Inicial | Finalidade |
|---|---|---|---|
| `000` | Mestre Mezzold | `M3zz0ld` | Usuário master de suporte técnico e controle de licença |

### 🧭 Fluxo de Primeiro Acesso:
1. Faça login com o usuário Master: `000` / `M3zz0ld`.
2. Acesse **`⚙️ Sistema ➔ Usuários`** e cadastre o usuário administrador e os operadores da empresa do cliente.
3. Ao realizar o primeiro login com a nova conta cadastrada, o sistema memoriza o usuário para preenchimento rápido em acessos futuros, exigindo sempre a senha de segurança.

---

## 💳 7. Licenciamento & Suporte Oficial Mezzold

- 📞 **WhatsApp de Suporte Técnico:** `+55 54 9713-1399` (`555497131399`)
- 🔑 **Chave PIX Oficial de Renovação:** `5554997030349` *(Mezzold Studios)*
- **Alerta de Vencimento:** Um alerta interativo pisca na barra inferior 3 dias antes do vencimento com botão de cópia de chave PIX, QR Code oficial EMV® e envio de comprovante em 1 clique via WhatsApp.
- **Bloqueio Automático:** Se a licença expirar, a tela de bloqueio exibe o QR Code dinâmico para liquidação imediata da mensalidade.

---

## 💻 8. Compilação Local & Lançador Instantâneo

- **Iniciar Localmente:** Dê um duplo clique no arquivo `MezzoldFinancial_Launcher.bat` na raiz do projeto.
- **Compilação Manual:**
  ```bash
  npm install
  npm run lint
  npm run build
  ```

