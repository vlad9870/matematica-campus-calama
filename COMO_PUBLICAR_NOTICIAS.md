# Matemática Campus Calama — notícias e arquivo

## Arquivos desta atualização

- `index.html`: mantém os quatro destaques e a cicloide animada; agora os destaques são atualizados automaticamente pelo JSON, com um link “Ver todas as notícias”.
- `noticias.html`: arquivo completo, com pesquisa, filtro por categoria e paginação (12 notícias por página).
- `noticia.html`: página de cada notícia, usando `?slug=` no endereço.
- `noticias.json`: **único arquivo em que você cadastra ou altera as notícias**.
- `noticias.js`: lê o JSON e monta automaticamente as três áreas.
- `site-base.js`: controla a navegação e o menu das páginas internas.
- `style.css`: preserva o visual e adiciona os estilos necessários.
- `imagens/`: inclui as sete imagens das competições da última atualização. Os arquivos antigos de fotos e logomarca continuam necessários.

## Instalação (sem apagar conteúdo existente)

1. Faça uma cópia de segurança da pasta do site.
2. Extraia o ZIP.
3. Copie `index.html`, `noticia.html`, `noticias.html`, `noticias.json`, `noticias.js`, `site-base.js` e `style.css` para a pasta principal do projeto (substitua apenas os arquivos de mesmo nome).
4. Copie as imagens fornecidas para sua pasta `imagens`, **mesclando o conteúdo**, sem excluir as outras fotografias nem a logo do portal.
5. Use o Live Server no VS Code (clique com o botão direito em `index.html` → Open with Live Server). Ao abrir HTML com duplo clique (`file://`), os navegadores geralmente bloqueiam a leitura local de `noticias.json`.
6. Após testar, publique no GitHub/Netlify **todos os arquivos novos**, inclusive `noticias.json` e `noticias.js`.

## Publicar uma notícia nova

Abra `noticias.json`, localize a lista `"noticias"` e adicione um novo objeto JSON separado por vírgula dos demais:

```json
{
  "slug": "exemplo-noticia-2026",
  "data": "2026-11-08",
  "tipo": "competicao",
  "categoria": "COMPETIÇÃO",
  "titulo": "Título completo da notícia",
  "tituloDestaque": "Título mais curto, se desejar",
  "resumo": "Resumo breve para os cartões.",
  "subtitulo": "Breve apresentação no topo da notícia.",
  "imagem": "imagens/minha-foto.webp",
  "legenda": "Descrição da imagem.",
  "largo": false,
  "paragrafos": [
    "Primeiro parágrafo da notícia.",
    "Segundo parágrafo da notícia."
  ],
  "link": {
    "url": "https://exemplo.org/",
    "texto": "Mais informações ↗"
  }
}
```

Esse exemplo é apenas um **modelo**: substitua os textos e a data pela data verdadeira da publicação. O formato da data é `AAAA-MM-DD`. Não esqueça de colocar o arquivo da foto na pasta `imagens`.

**Campos importantes:**

- `slug`: identificador único, minúsculo, sem espaços ou acentos. Uma vez publicado, não altere o slug; é ele que mantém o endereço antigo funcionando.
- `data`: data da publicação, não a data do evento. Para as quatro notícias anteriores, foi deixada `null` porque a data de publicação não estava informada. Elas continuam no arquivo sem uma data inventada.
- `tipo`: use `competicao`, `projeto`, `extensao`, `premiacao` ou `outros`.
- `titulo`, `resumo`, `subtitulo`, `imagem`, `legenda` e `paragrafos`: conteúdo da notícia.
- `largo`: use `true` para banners, que devem aparecer inteiros; `false` para fotografias.
- `link`: opcional, com URL e texto de um link relacionado. Pode omitir esse campo.
- `destaque`: opcional; use `false` se quiser manter uma notícia no arquivo sem mostrá-la entre os quatro destaques da home.
- `publicada`: opcional; use `false` para deixar uma notícia como rascunho (não aparece no site).
- `ordem`: opcional, usado para ordenar notícias antigas sem data cadastrada. Notícias novas com datas válidas aparecem primeiro.

**O que acontece automaticamente?** Quando você salva e publica o JSON, os quatro destaques da página inicial passam a mostrar as últimas quatro notícias elegíveis, enquanto as antigas ficam disponíveis em `noticias.html`. As notícias antigas nunca são excluídas automaticamente. O arquivo permite pesquisa por título/assunto, filtro e páginas de 12 resultados.

## Atenção sobre as imagens

A atualização traz as sete imagens das competições, mas as fotos antigas da home (`tom.jpeg`, `msf.jpeg`, `mostra_matematica.jpeg`, `professores.jpeg`) e a logo `logo-matematica-calama.webp` **não foram reenviadas neste pacote**. Elas devem permanecer em `imagens/` da sua instalação atual.

## Verificação de erros

Se o arquivo de notícias não carregar, confirme que os arquivos estão na mesma pasta e abra via Live Server ou Netlify. O `noticias.json` deve permanecer em JSON válido: use aspas duplas, vírgula entre objetos e nunca uma vírgula após o último item.
