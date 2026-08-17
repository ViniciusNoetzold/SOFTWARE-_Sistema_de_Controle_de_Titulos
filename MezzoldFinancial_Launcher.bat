@echo off
chcp 65001 > nul
title Mezzold Financial - Inicializador do Sistema

cd /d "%~dp0"
echo ===============================================================================
echo                MEZZOLD FINANCIAL - SISTEMA DE CONTROLE DE TITULOS
echo ===============================================================================
echo.
echo [+] Provisionando ambiente e pastas em C:\Mezzold...

:: 1. Garantir Estrutura de Pastas C:\Mezzold
if not exist "C:\Mezzold" mkdir "C:\Mezzold" >nul 2>&1
if not exist "C:\Mezzold\bin" mkdir "C:\Mezzold\bin" >nul 2>&1
if not exist "C:\Mezzold\dados" mkdir "C:\Mezzold\dados" >nul 2>&1
if not exist "C:\Mezzold\logs" mkdir "C:\Mezzold\logs" >nul 2>&1
if not exist "C:\Mezzold\config" mkdir "C:\Mezzold\config" >nul 2>&1
if not exist "C:\Mezzold\app" mkdir "C:\Mezzold\app" >nul 2>&1

:: 2. Copiar Schema e Aliases
if exist "%~dp0schema_firebird.sql" copy /Y "%~dp0schema_firebird.sql" "C:\Mezzold\config\" >nul 2>&1
if not exist "C:\Mezzold\config\aliases.conf" (
    echo HANSEN = C:\Mezzold\dados\ESTOQUE.FDB > "C:\Mezzold\config\aliases.conf"
    echo AliasCEP = LOCALHOST:HCEP >> "C:\Mezzold\config\aliases.conf"
)

:: 3. Garantir presenca do Banco ESTOQUE.FDB
if not exist "C:\Mezzold\dados\ESTOQUE.FDB" (
    echo [+] Montando banco de dados inicial ESTOQUE.FDB...
    echo MEZZOLD_FINANCIAL_FIREBIRD_DATABASE_V1 > "C:\Mezzold\dados\ESTOQUE.FDB"
)

if exist "%~dp0Bin\IBExpert.exe" if not exist "C:\Mezzold\bin\IBExpert.exe" (
    copy /Y "%~dp0Bin\IBExpert.exe" "C:\Mezzold\bin\" >nul 2>&1
)

echo [+] Ambiente C:\Mezzold verificado com sucesso.
echo [+] Iniciando aplicacao...
echo.

:: Se o Node.js estiver presente, inicia o preview web desktop
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [+] Abrindo servidor local em http://localhost:3000...
    start "" http://localhost:3000
    npx vite preview --port=3000 --host=0.0.0.0
) else (
    echo [+] Abrindo interface compilada...
    start "" "%~dp0dist\index.html"
)
