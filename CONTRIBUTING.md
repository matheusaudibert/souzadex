# Guia de Contribuição

Obrigado pelo interesse em contribuir com a Souzadex! Este documento explica como enviar um novo Souza e quais regras a contribuição precisa seguir.

## Como funciona

A Souzadex é uma galeria colaborativa de imagens do Souza (Vitor Souza) geradas por IA. Cada imagem vira um card na galeria, com:

- a imagem em si;
- o título (tirado do nome do arquivo);
- o número do Souza (a posição dele na ordem de chegada);
- o avatar e o link do perfil do GitHub de quem enviou.

O arquivo `souzas.js` é gerado automaticamente por um workflow do GitHub Actions quando o PR é aceito. Você não precisa (e não deve) editá-lo.

## Enviando um Souza

### Passo a passo

1. Faça um [fork do repositório](https://github.com/matheusaudibert/souzadex/fork).
2. Crie sua imagem do Souza usando a ferramenta de IA de sua preferência, a partir da [foto original](https://souzadex.vercel.app/souza.html?foto=original.jpeg) ou de alguma de suas variações já publicadas na galeria.
3. Dê ao arquivo o nome que será o título na galeria, sempre em minúsculo. Exemplos:
   - `astronauta.png` aparece como "astronauta"
   - `souza-samurai.jpg` aparece como "souza samurai" (hífens e underscores viram espaço)
4. No seu fork, crie uma branch nova para a contribuição (não use a `main`).
5. Adicione o(s) arquivo(s) à pasta `assets/images/`, cada um com um commit
   seguindo o padrão `feat: add [nome-da-imagem] to souzadex`.
6. Abra o Pull Request da sua branch para a `main` do repositório e preencha o checklist do template.
7. Aguarde a moderação. Depois do merge na `main`, o card aparece na galeria automaticamente.

### Requisitos da imagem

- Pode incluir várias imagens no mesmo Pull Request — cada uma precisa
  seguir as regras abaixo. Um check automático roda no PR e valida
  formato, pasta e nomes duplicados; se ele falhar, corrija e envie
  outro commit.
- Formatos aceitos: `.jpg`, `.jpeg`, `.png` ou `.gif`.
- A imagem deve estar em `assets/images/`.
- A imagem deve ser do Souza, gerada por IA.
- A imagem deve ser criada a partir da [foto original](https://souzadex.vercel.app/souza.html?foto=original.jpeg) ou de alguma de suas variações já publicadas na galeria.
- Boa qualidade: sem imagens borradas, cortadas ou ilegíveis.
- Não modifique nenhum outro arquivo do projeto no mesmo PR.
- Não repita um Souza que já existe na galeria (confira antes de enviar).

## Regras de conteúdo

Este é um projeto de humor, mas toda contribuição deve respeitar a imagem, a privacidade e a dignidade da pessoa retratada.

Não serão aceitas imagens que contenham:

- conteúdo sexual ou nudez;
- violência gráfica ou incentivo à violência;
- discurso de ódio, preconceito ou assédio;
- humilhação, difamação ou ataques pessoais;
- representação de crimes ou comportamentos ilegais como se fossem reais;
- conteúdo político ou publicitário que sugira apoio da pessoa retratada;
- informações pessoais ou privadas;
- outras pessoas reais sem contexto ou autorização adequada.

Imagens extremamente realistas podem ser recusadas quando houver risco de serem interpretadas como registros verdadeiros. A galeria prioriza imagens claramente fictícias, absurdas, estilizadas ou humorísticas.

## Moderação

Todas as contribuições passam por moderação. Os responsáveis pelo projeto ([matheusaudibert](https://github.com/matheusaudibert) e [dwego](https://github.com/dwego)) podem recusar ou remover imagens sem aviso prévio, especialmente quando considerarem que o conteúdo é ofensivo, enganoso, repetitivo, de baixa qualidade ou incompatível com a proposta da galeria.

A decisão da moderação é final, mas você pode abrir uma issue para conversar sobre ela.

## Removendo uma imagem

Se você enviou uma imagem e quer removê-la, abra uma [issue](https://github.com/matheusaudibert/souzadex/issues) explicando qual imagem deseja retirar. A equipe analisará o pedido, mas cópias, forks e versões antigas do repositório poderão continuar existindo fora do controle do projeto.

## Dúvidas

Confira o [FAQ](https://souzadex.vercel.app/faq.html) ou abra uma issue.
