@echo off
chcp 65001 >nul
echo ========================================
echo   CONG CU DAY CODE TU DONG LEN GITHUB
echo ========================================
echo.

:: Yêu cầu nhập nội dung commit
set /p msg="Nhap ghi chu (commit message): "

:: Nếu để trống không nhập gì, mặc định là "auto update"
if "%msg%"=="" set msg="auto update"

echo.
echo [1/3] Dang gom file (git add .)...
git add .

echo.
echo [2/3] Dang tao commit (git commit)...
git commit -m "%msg%"

echo.
echo [3/3] Dang day code len mang (git push)...
git push origin main

echo.
echo ========================================
echo          DAY CODE THANH CONG!
echo ========================================
pause