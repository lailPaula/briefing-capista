# CAPISTA — Briefing para Criação de Capas de Livros

Aplicação web moderna, intuitiva e profissional desenvolvida especificamente para facilitar o alinhamento criativo entre autores e designers de capas de livros.

---

## 🌟 Destaques do Projeto

- **Fluxo do Autor (2 a 4 minutos)**: 6 etapas focadas no que realmente importa, sem perguntas técnicas cansativas (sem resoluções, sangrias ou termos gráficos burocráticos).
- **Referência Visual com Destaque**: Upload fácil de até 3 imagens por arrastar e soltar (drag & drop), seleção de arquivo ou colar direto da área de transferência com `Ctrl+V` / `Cmd+V`.
- **Seleções Visuais e Táteis**:
  - Gêneros com cards e ícones
  - Exemplos clicáveis para inspiração imediata
  - Cards de estilo visual (Elegante, Minimalista, Misterioso, etc.)
  - Paleta de cores moderna com amostras e a opção *"✨ Pode decidir por mim"*
  - Campo de elementos indispensáveis com opção de 1 clique *"Não tenho preferência"*
- **Área do Designer (Admin)**:
  - Dashboard completo com contadores de status (*Novo, Em análise, Em produção, Aguardando cliente, Finalizado*).
  - Filtros instantâneos e busca em tempo real por título ou autor.
  - Modal com visualização ampliada de todas as imagens de referência com lightbox de tela cheia.
  - Bloco de anotações internas do designer.
  - **Baixar briefing em PDF**: Gera uma ficha técnica editorial em formato PDF de alta qualidade.
  - Copiar resumo para prancheta formatado para WhatsApp ou Notion.
- **Armazenamento e Resiliência**:
  - `IndexedDB` integrado com `localStorage`: Suporta fotos em alta resolução sem risco de estourar a cota de 5MB.
  - Salvamento automático de rascunhos para evitar perda de dados.

---

## 🚀 Como Executar Localmente (Localhost)

A aplicação é 100% autônoma (Single Page Application) e não requer instalação de pacotes pesados como Node ou Docker.

### Opção 1: Servidor Python (Recomendado)
Abra o terminal no diretório do projeto e execute:
```bash
python3 -m http.server 8000
```
Em seguida, abra seu navegador em:
👉 **[http://localhost:8000](http://localhost:8000)**

### Opção 2: Abertura Direta
Você também pode simplesmente dar um duplo clique no arquivo `index.html` para abrir diretamente no Chrome, Safari, Edge ou Firefox.

---

## 🔐 Acesso à Área do Designer

A **Área do Designer** possui acesso restrito e seguro:

- **E-mail autorizado**: `lailapauladesigner@gmail.com`
- **Senha**: `Luck1010#`

Ao tentar acessar a Área do Designer pelo menu superior, um modal elegante solicita a autenticação. Uma vez autenticado, a sessão é salva com segurança no navegador com opção de logout a qualquer momento.

---

## 📁 Estrutura de Arquivos

```
BRIEFING CAPISTA/
├── index.html              # Interface completa e responsiva (Tailwind CSS, Lucide e html2pdf)
├── assets/
│   ├── css/
│   │   └── styles.css      # Tipografia Cinzel, efeitos glassmorphism e animações
│   └── js/
│       ├── auth.js         # Serviço de autenticação e proteção da Área do Designer
│       ├── db.js           # Gerenciador IndexedDB e dados de exemplo
│       ├── state.js        # Estado do formulário, validações e auto-salvamento
│       ├── pdf-export.js   # Geração de PDF profissional com layout editorial
│       ├── designer.js     # Painel de gestão do designer, métricas e lightbox
│       └── app.js          # Controle de fluxo do autor, drag-and-drop e interações
└── README.md               # Documentação do projeto
```
