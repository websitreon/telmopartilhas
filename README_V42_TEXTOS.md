# V42 — textos corrigidos e sincronização CMS

Esta versão corrige os textos de teste da homepage e mantém a regra do projeto: os textos públicos devem existir em `public/data/content.js` e ser editáveis em `Admin > Conteúdo & textos`.

## Migração D1
A API aplica uma atualização única para a versão 42 (`contentVersion`) e substitui os valores antigos `TESTE`, `TESTE 1` e `TESTE 2` nos campos do Hero pelos textos finais. Depois dessa migração, novas alterações feitas no Admin continuam a ser guardadas normalmente na D1.
