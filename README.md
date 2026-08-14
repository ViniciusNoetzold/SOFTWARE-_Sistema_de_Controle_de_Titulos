# Mezzold Títulos

Mezzold Títulos é um aplicativo desktop construído utilizando **Tauri (Rust)** no backend e **React + Vite** no frontend.
Ele permite que os usuários façam o lançamento de títulos, gerando relatórios de forma simples e intuitiva através de uma interface moderna e rápida.

## Requisitos

- [Node.js](https://nodejs.org/) (recomendado v18 ou superior)
- npm (gerenciador de pacotes do Node)

**Nota:** Como este repositório possui fluxos do GitHub Actions (`CI/CD`), a compilação do executável final para Windows (`.exe`) é feita diretamente na nuvem! Você não precisa instalar a toolchain do Rust localmente, a menos que queira desenvolver e compilar manualmente na sua máquina.

## Scripts Disponíveis

No diretório raiz do projeto, você pode rodar os seguintes comandos:

### `npm install`
Instala todas as dependências necessárias para o frontend (React/Vite) e os utilitários do Tauri (CLI e API).

### `npm run dev`
Roda o servidor de desenvolvimento do Vite (porta 3000) e permite visualizar a interface via navegador web.

### `npm run build`
Gera a build de produção do frontend (na pasta `dist`).

### `npm run tauri:dev`
Inicializa a aplicação desktop utilizando o Tauri em modo de desenvolvimento.
Esse comando abre o app como se fosse um executável e suporta **Hot-Module Replacement (HMR)** (qualquer alteração no código React refletirá no app imediatamente).

*OBS: Requer a toolchain do Rust instalada na máquina.*

### `npm run tauri:build`
Compila a aplicação final, gerando um instalador e/ou um executável `.exe` leve dentro do diretório `src-tauri/target/release/`.

*OBS: Requer a toolchain do Rust instalada na máquina.*

## Arquitetura

1. **Frontend (React/Vite):** Utiliza TailwindCSS para estilo e componentes React. Toda a lógica de negócios e UI fica localizada na pasta `src/`.
2. **Backend (Tauri/Rust):** O boilerplate mínimo na pasta `src-tauri/` encapsula a build do React, gerenciando a janela nativa do SO.

## Geração Automática do Executável (.exe)

Este projeto possui um workflow configurado no GitHub Actions.
Sempre que uma nova release for publicada no GitHub (criando uma Tag como `v1.0.0`), o GitHub Actions será disparado para:
1. Instalar dependências (Node e Rust).
2. Fazer o build do frontend.
3. Compilar a aplicação via Tauri (`npm run tauri build`).
4. Anexar os artefatos de build (ex: `MezzoldTitulos_1.0.0_x64_en-US.msi` ou `.exe`) aos assets da Release do GitHub.

---
**Mezzold Studios © 2026**
