@echo off
cd /d "%~dp0"
echo ============================================================================
echo   DERMAKOR E-COMMERCE 2026 - CONECTADO A POSTGRESQL (dermakor_db)
echo   Servidor activo en: http://localhost:8080/index.html
echo ============================================================================
start "" "http://localhost:8080/index.html"
python server.py
pause
