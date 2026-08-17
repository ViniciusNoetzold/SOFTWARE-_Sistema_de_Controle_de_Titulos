@echo off
chcp 65001 > nul
title Mezzold Financial - Inicializador do Sistema

cd /d "%~dp0"
echo ===============================================================================
echo                MEZZOLD FINANCIAL - SISTEMA DE CONTROLE DE TITULOS
echo ===============================================================================
echo.
echo [+] Verificando ambiente e iniciando aplicacao...
echo.

:: Se o Node.js estiver presente, inicia o preview web desktop
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [+] Abrindo servidor local em http://localhost:3000...
    start "" http://localhost:3000
    npx vite preview --port=3000 --host=0.0.0.0
) else (
    echo [!] Node.js nao encontrado no PATH do sistema.
    echo [+] Tentando abrir interface diretamente...
    start "" "%~dp0dist\index.html"
)
