/* MATEMÁTICA CAMPUS CALAMA — NOTÍCIAS
 * Fonte única: noticias.json. Sem servidor de banco de dados.
 * Use um servidor local (ex.: Live Server no VS Code) para visualizar.
 */
(() => {
  'use strict';

  const POR_PAGINA = 12;
  const URL_DADOS = 'noticias.json';
  const TIPOS = {
    competicao: 'Competições',
    projeto: 'Projetos',
    extensao: 'Extensão',
    premiacao: 'Premiações',
    outros: 'Outras notícias'
  };

  function elemento(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined && texto !== null) el.textContent = String(texto);
    return el;
  }

  function limpaAcentos(valor) {
    return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function dataValida(valor) {
    return typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
      !Number.isNaN(Date.parse(valor + 'T12:00:00'));
  }

  function dataPorExtenso(valor) {
    if (!dataValida(valor)) return '';
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(valor + 'T12:00:00'));
  }

  function ordenar(noticias) {
    return noticias.slice().sort((a, b) => {
      const da = dataValida(a.data) ? a.data : '';
      const db = dataValida(b.data) ? b.data : '';
      if (da !== db) return db.localeCompare(da); // Novas publicações antes das antigas sem data.
      return (Number(b.ordem) || 0) - (Number(a.ordem) || 0);
    });
  }

  async function carregarNoticias() {
    const resposta = await fetch(URL_DADOS, { cache: 'no-store' });
    if (!resposta.ok) throw new Error('Não foi possível carregar noticias.json (' + resposta.status + ').');
    const dados = await resposta.json();
    if (!dados || !Array.isArray(dados.noticias)) throw new Error('Formato inválido do noticias.json.');
    const slugs = new Set();
    const noticias = dados.noticias.filter(n => {
      if (!n || n.publicada === false || typeof n.slug !== 'string' ||
          typeof n.titulo !== 'string' || !n.slug.trim()) return false;
      if (slugs.has(n.slug)) { console.warn('Notícia com slug duplicado:', n.slug); return false; }
      slugs.add(n.slug);
      return true;
    });
    return ordenar(noticias);
  }

  function urlNoticia(item) {
    return 'noticia.html?slug=' + encodeURIComponent(item.slug);
  }

  function criarImagem(item, className, carregar = 'lazy') {
    const img = elemento('img', className);
    img.loading = carregar;
    img.decoding = 'async';
    img.src = item.imagem;
    img.alt = item.legenda || item.titulo;
    img.addEventListener('error', () => { img.style.display = 'none'; });
    return img;
  }

  function criarDestaque(item, posicao) {
    const card = elemento('article', 'mosaic-card' + (posicao === 0 ? ' mosaic-featured' : ''));
    const link = elemento('a', 'mosaic-card-link');
    link.href = urlNoticia(item);
    link.setAttribute('aria-label', 'Ler notícia: ' + (item.tituloDestaque || item.titulo));
    const visual = elemento('div', 'mosaic-visual mosaic-visual-photo mosaic-visual-local');
    if (item.largo) visual.classList.add('mosaic-visual-banner');
    if (item.imagem) visual.append(criarImagem(item, '', posicao === 0 ? 'eager' : 'lazy'));
    else visual.append(elemento('span', 'news-no-image', 'Matemática Campus Calama'));
    const body = elemento('div', 'mosaic-body');
    body.append(elemento('span', 'label', item.categoria || 'NOTÍCIA'));
    body.append(elemento('h3', '', item.tituloDestaque || item.titulo));
    if (item.resumo) body.append(elemento('p', '', item.resumo));
    const acao = elemento('span', 'mosaic-link', 'Ler notícia ↗');
    body.append(acao);
    link.append(visual, body);
    card.append(link);
    return card;
  }

  function exibirDestaques(noticias) {
    const grade = document.getElementById('noticias-destaques');
    if (!grade) return;
    const destaques = noticias.filter(n => n.destaque !== false).slice(0, 4);
    if (!destaques.length) {
      grade.replaceChildren(elemento('p', 'news-empty', 'Nenhuma notícia cadastrada no momento.'));
      return;
    }
    grade.replaceChildren(...destaques.map(criarDestaque));
  }

  function criarCartaoArquivo(item) {
    const artigo = elemento('article', 'news-card');
    const link = elemento('a', 'news-card-link');
    link.href = urlNoticia(item);
    const visual = elemento('div', 'news-card-visual' + (item.largo ? ' news-card-visual--contain' : ''));
    if (item.imagem) visual.append(criarImagem(item, ''));
    else visual.append(elemento('span', 'news-no-image', 'Matemática Campus Calama'));
    const corpo = elemento('div', 'news-card-body');
    const meta = elemento('div', 'news-card-meta');
    meta.append(elemento('span', 'news-card-category', item.categoria || TIPOS[item.tipo] || 'NOTÍCIA'));
    if (dataValida(item.data)) {
      const time = elemento('time', 'news-card-date', dataPorExtenso(item.data));
      time.dateTime = item.data;
      meta.append(time);
    }
    corpo.append(meta, elemento('h2', '', item.titulo));
    if (item.resumo || item.subtitulo) corpo.append(elemento('p', '', item.resumo || item.subtitulo));
    corpo.append(elemento('span', 'news-card-read', 'Ler notícia ↗'));
    link.append(visual, corpo);
    artigo.append(link);
    return artigo;
  }

  function inicializarArquivo(noticias) {
    const grade = document.getElementById('news-archive-grid');
    if (!grade) return;
    const campo = document.getElementById('news-search');
    const filtro = document.getElementById('news-category');
    const contador = document.getElementById('news-results-count');
    const paginacao = document.getElementById('news-pagination');
    const params = new URLSearchParams(window.location.search);
    let pagina = Math.max(1, Number.parseInt(params.get('pagina'), 10) || 1);

    const tipoInicial = params.get('categoria') || 'todas';
    if ([...filtro.options].some(opcao => opcao.value === tipoInicial)) filtro.value = tipoInicial;
    campo.value = params.get('busca') || '';

    function atualizarURL() {
      const url = new URL(window.location.href);
      if (campo.value.trim()) url.searchParams.set('busca', campo.value.trim());
      else url.searchParams.delete('busca');
      if (filtro.value !== 'todas') url.searchParams.set('categoria', filtro.value);
      else url.searchParams.delete('categoria');
      if (pagina > 1) url.searchParams.set('pagina', String(pagina));
      else url.searchParams.delete('pagina');
      window.history.replaceState(null, '', url);
    }

    function criarBotaoPagina(texto, destino, desabilitado, label, atual) {
      const botao = elemento('button', 'news-page-button' + (atual ? ' is-current' : ''), texto);
      botao.type = 'button';
      botao.disabled = desabilitado;
      botao.setAttribute('aria-label', label);
      if (atual) botao.setAttribute('aria-current', 'page');
      botao.addEventListener('click', () => {
        pagina = destino;
        atualizar();
        document.getElementById('news-archive-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return botao;
    }

    function atualizar() {
      const termo = limpaAcentos(campo.value.trim());
      const tipo = filtro.value;
      const selecionadas = noticias.filter(item => {
        if (tipo !== 'todas' && item.tipo !== tipo) return false;
        if (!termo) return true;
        return limpaAcentos([
          item.titulo, item.tituloDestaque, item.categoria, item.resumo, item.subtitulo,
          ...(Array.isArray(item.paragrafos) ? item.paragrafos : [])
        ].join(' ')).includes(termo);
      });
      const totalPaginas = Math.max(1, Math.ceil(selecionadas.length / POR_PAGINA));
      pagina = Math.min(Math.max(1, pagina), totalPaginas);
      const primeiro = (pagina - 1) * POR_PAGINA;
      const visiveis = selecionadas.slice(primeiro, primeiro + POR_PAGINA);
      grade.replaceChildren(...visiveis.map(criarCartaoArquivo));
      if (!selecionadas.length) {
        grade.append(elemento('p', 'news-empty', 'Nenhuma notícia encontrada. Experimente outra busca ou categoria.'));
        contador.textContent = 'Nenhuma notícia encontrada.';
      } else {
        contador.textContent = 'Exibindo ' + (primeiro + 1) + '–' + (primeiro + visiveis.length) +
          ' de ' + selecionadas.length + (selecionadas.length === 1 ? ' notícia.' : ' notícias.');
      }
      paginacao.replaceChildren();
      if (totalPaginas > 1) {
        paginacao.append(criarBotaoPagina('← Anterior', pagina - 1, pagina === 1, 'Página anterior', false));
        const inicio = Math.max(1, Math.min(pagina - 2, totalPaginas - 4));
        const fim = Math.min(totalPaginas, inicio + 4);
        for (let numero = inicio; numero <= fim; numero++) {
          paginacao.append(criarBotaoPagina(String(numero), numero, numero === pagina,
            'Página ' + numero, numero === pagina));
        }
        paginacao.append(criarBotaoPagina('Próxima →', pagina + 1, pagina === totalPaginas, 'Próxima página', false));
      }
      atualizarURL();
    }

    campo.addEventListener('input', () => { pagina = 1; atualizar(); });
    filtro.addEventListener('change', () => { pagina = 1; atualizar(); });
    atualizar();
  }

  function inicializarNoticia(noticias) {
    const titulo = document.getElementById('story-title');
    if (!titulo) return;
    const slug = new URLSearchParams(window.location.search).get('slug');
    const item = noticias.find(n => n.slug === slug);
    const container = document.getElementById('story-content');
    if (!item) {
      document.title = 'Notícia não encontrada | Matemática Campus Calama';
      titulo.textContent = 'Notícia não encontrada';
      document.getElementById('story-category').textContent = 'ARQUIVO DE NOTÍCIAS';
      document.getElementById('story-lead').textContent = 'A publicação pode ter sido removida ou o endereço está incorreto.';
      document.getElementById('story-image-frame').hidden = true;
      document.getElementById('story-caption').hidden = true;
      container.append(elemento('p', '', 'Consulte o arquivo para encontrar outras notícias do campus.'));
      const p = elemento('p');
      const a = elemento('a', 'story-related-link', 'Ver todas as notícias ↗');
      a.href = 'noticias.html';
      p.append(a); container.append(p);
      return;
    }
    document.title = item.titulo + ' | Matemática Campus Calama';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = item.resumo || item.subtitulo || item.titulo;
    document.getElementById('story-category').textContent = item.categoria || 'NOTÍCIA';
    titulo.textContent = item.titulo;
    document.getElementById('story-lead').textContent = item.subtitulo || item.resumo || '';
    const data = document.getElementById('story-date');
    if (dataValida(item.data)) { data.dateTime = item.data; data.textContent = 'Publicado em ' + dataPorExtenso(item.data); data.hidden = false; }
    const frame = document.getElementById('story-image-frame');
    const imagem = document.getElementById('story-image');
    const legenda = document.getElementById('story-caption');
    if (item.imagem) {
      imagem.src = item.imagem;
      imagem.alt = item.legenda || item.titulo;
      imagem.classList.toggle('story-image-wide', Boolean(item.largo));
      imagem.addEventListener('error', () => { frame.hidden = true; legenda.hidden = true; });
      if (item.legenda) legenda.textContent = item.legenda;
      else legenda.hidden = true;
    } else { frame.hidden = true; legenda.hidden = true; }
    container.replaceChildren();
    for (const paragrafo of (Array.isArray(item.paragrafos) ? item.paragrafos : [])) {
      container.append(elemento('p', '', paragrafo));
    }
    if (item.link && typeof item.link.url === 'string') {
      const destino = item.link.url;
      if (/^(https?:\/\/|[a-z0-9_.-]+\.html(?:[?#].*)?)$/i.test(destino)) {
        const p = elemento('p');
        const a = elemento('a', 'story-related-link', item.link.texto || 'Saiba mais ↗');
        a.href = destino;
        if (/^https?:\/\//i.test(destino)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        p.append(a); container.append(p);
      }
    }
  }

  function mostrarErro(error) {
    console.error('Falha ao carregar o arquivo de notícias:', error);
    const mensagem = 'Não foi possível carregar as notícias. Confira se noticias.json está na pasta do site e abra pelo Live Server (ou pelo Netlify).';
    const grade = document.getElementById('news-archive-grid');
    if (grade) grade.replaceChildren(elemento('p', 'news-error', mensagem));
    const contador = document.getElementById('news-results-count');
    if (contador) contador.textContent = 'Conteúdo indisponível.';
    const artigo = document.getElementById('story-content');
    if (artigo) {
      document.getElementById('story-title').textContent = 'Não foi possível abrir esta notícia';
      document.getElementById('story-lead').textContent = mensagem;
      document.getElementById('story-image-frame').hidden = true;
    }
    // Na home, os 4 cartões originais permanecem como reserva se o JSON não carregar.
  }

  carregarNoticias().then(noticias => {
    exibirDestaques(noticias);
    inicializarArquivo(noticias);
    inicializarNoticia(noticias);
  }).catch(mostrarErro);
})();
