# Formulário de parcerias

A secção "Queres colaborar ou ser parceiro?" inclui agora um formulário de parceria.

## Funcionamento
- O visitante preenche nome, empresa/equipa, email, Instagram/site, tipo de parceria e mensagem.
- O pedido é enviado para `POST /api/messages`, usando a mesma inbox já existente no Admin.
- O assunto fica no formato `PARCERIA · <tipo>` para ser facilmente identificado.
- No painel Admin > Mensagens, os pedidos aparecem automaticamente com a etiqueta `PARCERIA`.
- Os mesmos mecanismos de segurança, rate limit e validação do formulário de contactos são reutilizados.
