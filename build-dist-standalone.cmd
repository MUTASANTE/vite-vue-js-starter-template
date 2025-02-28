pushd "%~dp0" || goto fin
call "%ARP_PHP_CONF_83%\npm" install
call "%ARP_PHP_CONF_83%\npx" update-browserslist-db@latest --update-db --yes
call "%ARP_PHP_CONF_83%\npm" audit fix
call "%ARP_PHP_CONF_83%\npm" prune
call "%ARP_PHP_CONF_83%\npm" dedupe
call "%ARP_PHP_CONF_83%\npx" npm-force-resolutions
call "%ARP_PHP_CONF_83%\npx" patch-package
call "%ARP_PHP_CONF_83%\npm" run build -- --mode standalone

popd

:fin
