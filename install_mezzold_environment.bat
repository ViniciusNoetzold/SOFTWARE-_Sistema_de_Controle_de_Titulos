@echo off
chcp 65001 > nul
title Instalador e Configurador Mezzold Financial - Firebird 2.5.9

echo ===============================================================================
echo        MEZZOLD FINANCIAL - SISTEMA DE CONTROLE DE TITULOS & CUSTODIA
echo                   INSTALADOR AUTOMATICO DE AMBIENTE CLIENTE
echo ===============================================================================
echo.

:: 1. Criacao da Estrutura de Pastas Padronizada C:\Mezzold
echo [1/5] Criando estrutura de pastas em C:\Mezzold...
if not exist "C:\Mezzold" mkdir "C:\Mezzold"
if not exist "C:\Mezzold\bin" mkdir "C:\Mezzold\bin"
if not exist "C:\Mezzold\dados" mkdir "C:\Mezzold\dados"
if not exist "C:\Mezzold\logs" mkdir "C:\Mezzold\logs"
if not exist "C:\Mezzold\config" mkdir "C:\Mezzold\config"
if not exist "C:\Mezzold\app" mkdir "C:\Mezzold\app"
echo [+] Estrutura de diretorios C:\Mezzold criada com sucesso.
echo.

:: 2. Copia dos Utilitarios, Binarios e DLLs
echo [2/5] Copiando binarios e ferramentas de gestao para C:\Mezzold\bin...
if exist "%~dp0Bin\IBExpert.exe" copy /Y "%~dp0Bin\IBExpert.exe" "C:\Mezzold\bin\" > nul
if exist "%~dp0Bin\IBEScript.exe" copy /Y "%~dp0Bin\IBEScript.exe" "C:\Mezzold\bin\" > nul
if exist "%~dp0schema_firebird.sql" copy /Y "%~dp0schema_firebird.sql" "C:\Mezzold\config\" > nul
echo [+] Arquivos de gestao e schema copiados.
echo.

:: 3. Instalacao Silenciosa do Servidor Firebird 2.5.9
echo [3/5] Verificando e instalando Firebird 2.5.9...
set FB_INSTALLER=
if exist "%~dp0Bin\Firebird-2.5.9.27139_0_x64.exe" (
    set FB_INSTALLER="%~dp0Bin\Firebird-2.5.9.27139_0_x64.exe"
) else if exist "%~dp0Bin\Firebird-2.5.9.27139_0_Win32.exe" (
    set FB_INSTALLER="%~dp0Bin\Firebird-2.5.9.27139_0_Win32.exe"
)

if defined FB_INSTALLER (
    echo [+] Executando instalacao do Firebird 2.5.9 em modo silencioso...
    %FB_INSTALLER% /SILENT /SUPPRESSMSGBOXES /NORESTART /SP-
    echo [+] Servidor Firebird 2.5.9 instalado e servico registrado.
) else (
    echo [!] Instalador do Firebird nao encontrado na pasta Bin.
)
echo.

:: 4. Configuracao do aliases.conf do Firebird com o Alias HANSEN
echo [4/5] Configurando Alias oficial [HANSEN] no Firebird...
set ALIAS_FILE=
if exist "C:\Program Files\Firebird\Firebird_2_5\aliases.conf" (
    set ALIAS_FILE="C:\Program Files\Firebird\Firebird_2_5\aliases.conf"
) else if exist "C:\Program Files (x86)\Firebird\Firebird_2_5\aliases.conf" (
    set ALIAS_FILE="C:\Program Files (x86)\Firebird\Firebird_2_5\aliases.conf"
)

if defined ALIAS_FILE (
    echo. >> %ALIAS_FILE%
    echo # === ALIAS MEZZOLD FINANCIAL === >> %ALIAS_FILE%
    echo HANSEN = C:\Mezzold\dados\ESTOQUE.FDB >> %ALIAS_FILE%
    echo AliasCEP = LOCALHOST:HCEP >> %ALIAS_FILE%
    echo [+] Alias [HANSEN] configurado com sucesso em %ALIAS_FILE%.
) else (
    echo [!] Arquivo aliases.conf nao encontrado automaticamente. Criando copia em C:\Mezzold\config\aliases.conf
    echo HANSEN = C:\Mezzold\dados\ESTOQUE.FDB > "C:\Mezzold\config\aliases.conf"
    echo AliasCEP = LOCALHOST:HCEP >> "C:\Mezzold\config\aliases.conf"
)
echo.

:: 5. Copia da fbclient.dll para a pasta bin
echo [5/5] Copiando DLLs de conexao (fbclient.dll)...
if exist "C:\Program Files\Firebird\Firebird_2_5\bin\fbclient.dll" (
    copy /Y "C:\Program Files\Firebird\Firebird_2_5\bin\fbclient.dll" "C:\Mezzold\bin\" > nul
    echo [+] fbclient.dll copiada para C:\Mezzold\bin\
) else if exist "C:\Program Files (x86)\Firebird\Firebird_2_5\bin\fbclient.dll" (
    copy /Y "C:\Program Files (x86)\Firebird\Firebird_2_5\bin\fbclient.dll" "C:\Mezzold\bin\" > nul
    echo [+] fbclient.dll copiada para C:\Mezzold\bin\
)

echo.
echo ===============================================================================
echo                    INSTALACAO CONCLUIDA COM SUCESSO!
echo ===============================================================================
echo Diretorio de dados: C:\Mezzold\dados\ESTOQUE.FDB
echo Alias do Firebird:  HANSEN
echo Ferramentas:        C:\Mezzold\bin\IBExpert.exe
echo ===============================================================================
echo.
pause
