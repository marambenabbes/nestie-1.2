@echo off
REM Helper script to load environment variables from .env file
REM This is called by other batch scripts

if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and fill in your API keys.
    exit /b 1
)

REM Read .env file and set environment variables
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    REM Skip comments and empty lines
    echo %%a | findstr /r "^#" >nul
    if errorlevel 1 (
        if not "%%a"=="" (
            if not "%%b"=="" (
                set "%%a=%%b"
            )
        )
    )
)

exit /b 0
