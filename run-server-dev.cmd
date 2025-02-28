REM Mise a jour des dependances du projet
pushd "%~dp0" || goto fin
call "%ARP_PHP_CONF_83%\npm" update
call "%ARP_PHP_CONF_83%\npx" npm-force-resolutions
call "%ARP_PHP_CONF_83%\npx" patch-package
REM Lancement du serveur de dev
set current_dir=%~dp0
call "%ARP_PHP_CONF_83%\npm" run dev

:fin
