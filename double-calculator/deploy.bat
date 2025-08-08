@echo off
REM 🚀 Script de déploiement GitHub Pages - Calculatrice Pro ESIEA
REM Auteur : Euloge Mabiala
REM Date : 2024

echo 🚀 Déploiement GitHub Pages - Calculatrice Pro ESIEA
echo ==================================================

REM Vérification de Git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérification du statut Git
if not exist ".git" (
    echo [ERROR] Ce n'est pas un repository Git. Veuillez initialiser Git d'abord.
    pause
    exit /b 1
)

echo [STEP] 1. Vérification du statut Git...
git status --porcelain > temp_status.txt
set /p git_status=<temp_status.txt
del temp_status.txt

if not "%git_status%"=="" (
    echo [WARNING] Il y a des changements non commités :
    git status --porcelain
    set /p continue="Voulez-vous continuer ? (y/n): "
    if /i not "%continue%"=="y" (
        echo [ERROR] Déploiement annulé.
        pause
        exit /b 1
    )
)

echo [STEP] 2. Vérification de la branche...
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i

if not "%current_branch%"=="main" (
    echo [WARNING] Vous n'êtes pas sur la branche main. Branche actuelle : %current_branch%
    set /p switch="Voulez-vous basculer vers la branche main ? (y/n): "
    if /i "%switch%"=="y" (
        git checkout main
        echo [INFO] Basculé vers la branche main.
    ) else (
        echo [ERROR] Déploiement annulé.
        pause
        exit /b 1
    )
)

echo [STEP] 3. Ajout des fichiers...
git add .

echo [STEP] 4. Commit des changements...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"
git commit -m "🚀 Deploy: %datestamp% - Calculatrice Pro ESIEA"

echo [STEP] 5. Push vers GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo [INFO] ✅ Push réussi !
    echo.
    echo 🎉 Déploiement en cours...
    echo ⏳ Attendez 2-5 minutes pour que GitHub Pages se mette à jour.
    echo.
    echo 📊 URLs de votre application :
    echo    🌐 Production : https://eulogep.github.io/double-calculatrice/
    echo    📱 Alternative : https://eulogep.github.io/double-calculatrice/index.html
    echo.
    echo 🔍 Vérification :
    echo    1. Allez sur https://github.com/eulogep/double-calculatrice/actions
    echo    2. Vérifiez que le workflow 'Deploy to GitHub Pages' s'exécute
    echo    3. Attendez que le statut devienne vert
    echo.
    echo 📞 Contact pour les recruteurs :
    echo    📧 Email : mabiala@et.esiea.fr
    echo    💼 LinkedIn : https://www.linkedin.com/in/euloge-junior-mabiala
    echo    🐙 GitHub : https://github.com/eulogep
    echo.
    echo [INFO] 🎯 Votre calculatrice pro est maintenant en ligne et prête à impressionner les recruteurs !
) else (
    echo [ERROR] ❌ Erreur lors du push. Vérifiez votre connexion et vos permissions.
    pause
    exit /b 1
)

pause
