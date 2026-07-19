@echo off
setlocal
set GRADLE_VERSION=8.13
set BASE_DIR=%~dp0
set CACHE_DIR=%BASE_DIR%.gradle-bootstrap
set ZIP=%CACHE_DIR%\gradle-%GRADLE_VERSION%-bin.zip
set GRADLE_HOME=%CACHE_DIR%\gradle-%GRADLE_VERSION%
if exist "%GRADLE_HOME%\bin\gradle.bat" goto run
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%"
if not exist "%ZIP%" powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing 'https://services.gradle.org/distributions/gradle-%GRADLE_VERSION%-bin.zip' -OutFile '%ZIP%'"
if errorlevel 1 exit /b 1
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Force '%ZIP%' '%CACHE_DIR%'"
if errorlevel 1 exit /b 1
:run
call "%GRADLE_HOME%\bin\gradle.bat" %*
endlocal
