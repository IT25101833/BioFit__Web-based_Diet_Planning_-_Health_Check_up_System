@echo off
REM Always start BioFit against SQL Server (SSMS: localhost\MSSQLSERVER01, database biofit)
cd /d "%~dp0"
echo Starting BioFit backend with SQL Server profile...
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=sqlserver
