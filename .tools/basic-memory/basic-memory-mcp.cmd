@echo off
setlocal

for %%I in ("%~dp0..\..") do set "WORKSPACE=%%~fI"
set "BASIC_MEMORY_EXE=%USERPROFILE%\.local\bin\basic-memory.exe"
set "BASIC_MEMORY_CONFIG_DIR=%WORKSPACE%\.bm-state\config"
set "HOME=%WORKSPACE%\.bm-state\home"
set "USERPROFILE=%HOME%"
set "PYTHONIOENCODING=utf-8"
set "BASIC_MEMORY_NO_PROMOS=1"

if not exist "%BASIC_MEMORY_CONFIG_DIR%" mkdir "%BASIC_MEMORY_CONFIG_DIR%"
if not exist "%HOME%\.basic-memory" mkdir "%HOME%\.basic-memory"

"%BASIC_MEMORY_EXE%" %*
