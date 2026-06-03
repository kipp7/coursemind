@echo off
setlocal

for %%I in ("%~dp0..\..") do set "WORKSPACE=%%~fI"
set "BASIC_MEMORY_EXE=%USERPROFILE%\.local\bin\basic-memory.exe"
set "BASIC_MEMORY_CONFIG_DIR=%WORKSPACE%\.bm-state\config"
set "HOME=%WORKSPACE%\.bm-state\home"
set "USERPROFILE=%HOME%"
set "PYTHONIOENCODING=utf-8"
set "BASIC_MEMORY_NO_PROMOS=1"
set "BASIC_MEMORY_SEMANTIC_SEARCH_ENABLED=false"
set "LOCKDIR=%WORKSPACE%\.bm-state\cli.lock"

if not exist "%BASIC_MEMORY_CONFIG_DIR%" mkdir "%BASIC_MEMORY_CONFIG_DIR%"
if not exist "%HOME%\.basic-memory" mkdir "%HOME%\.basic-memory"
if not exist "%WORKSPACE%\.bm-state" mkdir "%WORKSPACE%\.bm-state"

:acquire_lock
2>nul mkdir "%LOCKDIR%" && goto run_command
ping -n 2 127.0.0.1 >nul
goto acquire_lock

:run_command
"%BASIC_MEMORY_EXE%" %*
set "EXITCODE=%ERRORLEVEL%"
rmdir "%LOCKDIR%" >nul 2>&1
exit /b %EXITCODE%
