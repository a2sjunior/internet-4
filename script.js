/**
 * 1. MODO ESCURO (Manipulação de Classes e LocalStorage)
 */
const btnTema = document.getElementById('btn-tema');

// Verifica se o usuário já tinha salvo a preferência antes
if (localStorage.getItem('tema') === 'escuro') {
    document.body.classList.add('dark-theme');
    btnTema.textContent = '☀️ Modo Claro';
}

btnTema.addEventListener('click', () => {
    // Alterna a classe no body
    document.body.classList.toggle('dark-theme');
    
    // Verifica se a classe foi adicionada para alterar o texto e salvar
    if (document.body.classList.contains('dark-theme')) {
        btnTema.textContent = '☀️ Modo Claro';
        localStorage.setItem('tema', 'escuro');
    } else {
        btnTema.textContent = '🌙 Modo Escuro';
        localStorage.setItem('tema', 'claro');
    }
});

/**
 * 2. ROTAS E CONTEÚDOS DINÂMICOS (Simulando uma SPA)
 */
const appConteiner = document.getElementById('app');

// Banco de dados de "Páginas" em HTML
const paginas = {
    home: `
        <div class="card">
            <h2>Bem-vindo à Home</h2>
            <p>Este conteúdo foi injetado dinamicamente via JavaScript.</p>
            <p>Navegue pelo menu acima para carregar outros componentes sem recarregar a página!</p>
        </div>
    `,
    player: `
        <div class="card">
        <h2>Player de Vídeo Dinâmico</h2>
        <video id="meuVideo" controls width="100%">
            <source src="video.mp4" type="video/mp4">
        </video>
        <div class="video-controles-info">
            <p id="statusVideo">Aperte Play para iniciar.</p>
            <p>Tempo: <span id="tempoAtual">00:00</span> / <span id="tempoTotal">00:00</span></p>
        </div>
        </div>
    `,
    cadastro: `
        <div class="card">
            <h2>Formulário Dinâmico</h2>
            <form id="formCadastro" novalidate>
                <label>Nome:</label>
                <input type="text" id="inputNome" placeholder="Digite seu nome">
                
                <label>Telefone:</label>
                <input type="text" id="inputTel" placeholder="(00) 00000-0000" maxlength="15">
                
                <button type="submit">Enviar Dados</button>
                <div id="mensagemBox"></div>
            </form>
        </div>
    `
};

// Função principal que lê a URL e injeta o conteúdo
function renderizarPagina() {
    // Pega o que está depois do # (ex: #player vira player)
    let rota = location.hash.replace('#', '') || 'home';

    // Injeta o conteúdo no DOM
    if (paginas[rota]) {
        appConteiner.innerHTML = paginas[rota];
    } else {
        appConteiner.innerHTML = `<div class="card"><h2>Erro 404: Página não encontrada</h2></div>`;
    }

    // Como o DOM mudou, precisamos reconectar os eventos dos elementos novos
    if (rota === 'player') configurarEventosVideo();
    if (rota === 'cadastro') configurarEventosFormulario();
}

/**
 * 3. EVENTOS DE MÍDIA E VISIBILIDADE
 */
function configurarEventosVideo() {
    const video = document.querySelector('#meuVideo');
    const status = document.querySelector('#statusVideo');
    const tempoAtualSpan = document.querySelector('#tempoAtual');
    const tempoTotalSpan = document.querySelector('#tempoTotal');

    if (!video) return; // Segurança caso o elemento ainda não esteja no DOM

    // Evento ao dar Play
    video.addEventListener('play', () => {
        status.textContent = '▶️ Vídeo tocando...';
    });

    // Evento ao Pausar
    video.addEventListener('pause', () => {
        status.textContent = '⏸️ Vídeo pausado.';
    });

    // 1. MOSTRADOR DE TEMPO (Evento: timeupdate)
    // Esse evento dispara várias vezes por segundo enquanto o vídeo roda
    video.addEventListener('timeupdate', () => {
        // Atualiza o tempo atual formatado (ex: 01:23)
        tempoAtualSpan.textContent = formatarTempo(video.currentTime);
    });

    // Evento quando os metadados são carregados (para saber a duração total do vídeo)
    video.addEventListener('loadedmetadata', () => {
        tempoTotalSpan.textContent = formatarTempo(video.duration);
    });

    // 2. AUTO-PAUSE AO SAIR DA ABA (Evento: visibilitychange)
    // Registramos o evento no 'document' para fofocar quando a aba mudar
    const lidarComMudancaVisibilidade = () => {
        // Se a página ficar oculta (hidden) E o vídeo NÃO estiver pausado
        if (document.visibilityState === 'hidden' && !video.paused) {
            video.pause();
            console.log("Vídeo pausado por falta de visibilidade.");
        }
    };

    // Adiciona o ouvinte de visibilidade
    document.addEventListener('visibilitychange', lidarComMudancaVisibilidade);

    // IMPORTANTE: Como é uma SPA e o vídeo é destruído ao mudar de aba, 
    // precisamos limpar o evento de visibilidade para não acumular lixo na memória.
    window.addEventListener('hashchange', () => {
        document.removeEventListener('visibilitychange', lidarComMudancaVisibilidade);
    }, { once: true }); // Executa essa limpeza apenas uma vez por mudança de rota
}

/**
 * FUNÇÃO AUXILIAR: Formata segundos puramente em formato MM:SS
 * Excelente oportunidade para mostrar manipulação de strings/números para os alunos!
 */
function formatarTempo(segundosTotais) {
    const minutos = Math.floor(segundosTotais / 60);
    const segundos = Math.floor(segundosTotais % 60);
    
    // Força ter sempre 2 dígitos (ex: 05 em vez de 5) usando o padStart
    const minutosFormatados = String(minutos).padStart(2, '0');
    const segundosFormatados = String(segundos).padStart(2, '0');
    
    return `${minutosFormatados}:${segundosFormatados}`;
}

/**
 * 4. EVENTOS DE FORMULÁRIO E CRIAÇÃO DE NÓS DOM
 */
function configurarEventosFormulario() {
    const form = document.querySelector('#formCadastro');
    const inputTel = document.querySelector('#inputTel');
    const inputNome = document.querySelector('#inputNome');
    const boxMensagem = document.querySelector('#mensagemBox');

    if (!form) return;

    // Máscara de Telefone (evento: input)
    inputTel.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, ""); // Tira tudo que não é número
        if (v.length > 0) v = "(" + v;
        if (v.length > 3) v = v.slice(0, 3) + ") " + v.slice(3);
        if (v.length > 10) v = v.slice(0, 10) + "-" + v.slice(10, 14);
        e.target.value = v;
    });

    // Validação (evento: submit) e criação de nós no DOM
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        // Limpa mensagens anteriores definindo o innerHTML como vazio
        boxMensagem.innerHTML = "";

        if (inputNome.value.trim() === '') {
            // Mensagem de erro: cria um <span> dinamicamente e adiciona ao boxMensagem
            const spanErro = document.createElement('span');
            spanErro.classList.add('erro');
            spanErro.textContent = 'O campo nome é obrigatório!';
            boxMensagem.appendChild(spanErro);
        } else {
            const spanSucesso = document.createElement('span');
            spanSucesso.style.color = '#2ecc71';
            spanSucesso.innerHTML = `<strong>Sucesso!</strong> Obrigado, ${inputNome.value}.`;
            boxMensagem.appendChild(spanSucesso);
            form.reset();
        }
    });
}

/**
 * 5. INICIALIZAÇÃO DA APLICAÇÃO
 */
// Escuta as mudanças de # na URL
window.addEventListener('hashchange', renderizarPagina);

// Renderiza a página correta ao carregar o site pela primeira vez
window.addEventListener('load', renderizarPagina);