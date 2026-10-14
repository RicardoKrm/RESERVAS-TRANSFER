@echo off
title RESERVAS ERP - Plataforma de Operaciones
color 0B
echo ======================================================================
echo          RESERVAS ERP - PLATAFORMA DE TRANSFERS Y TURISMO
echo ======================================================================
echo.
echo Iniciando servidor local en el puerto 5174...
echo.

cd /d "%~dp0"

:: Abrir navegador automaticamente despues de 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5174/"

:: Ejecutar Vite
call npm run dev -- --port 5174 --host

pause
