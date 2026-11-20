@echo off
title LEONIDA FM
cd /d "%~dp0"
echo.
echo   Iniciando LEONIDA FM e abrindo no navegador...
echo   (Feche esta janela ou pressione Ctrl+C para encerrar o servidor)
echo.
call npm.cmd run dev -- --open
if errorlevel 1 (
  echo.
  echo   Erro ao iniciar o servidor. Verifique se o Node.js esta instalado.
  pause
)
