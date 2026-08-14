@echo off
title HocDrill English Drilling - Local Server
echo ===================================================
echo   DANG KHOI DONG HE THONG HOCDRILL TAI LOCAL
echo   Dia chi: http://localhost:3000
echo   Microphone se duoc luu quyen su dung vinh vien!
echo ===================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:3000
node server.js
pause
