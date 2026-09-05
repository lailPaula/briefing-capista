---
name: editorial-book-craft
description: Guidelines and heuristics for book design, literary atelier interfaces, and publishing aesthetics. Use when designing web apps, briefings, portfolios, or tools for book cover designers, publishers, authors, and literary agencies.
---

# Editorial Book Craft: Ateliê de Design Editorial

Este guia define os padrões visuais, estruturais e de tom de voz para interfaces de estúdios e capistas de livros, elevando a experiência para o patamar de ateliês de design de prestígio internacional (Taschen, Penguin Classics, Faber & Faber, Kinfolk).

## 1. DNA Visual & Atmosfera Editorial

- **Canvas & Texturas**: A tela deve evocar o papel artesanal nobre, linho ou tecido de encadernação. Usar fundos quentes com micro-texturas suaves ou gradientes sutis de luz de estúdio.
- **Paleta de Cor de Livraria & Ateliê**:
  - Tinta preta profunda (Deep Charcoal / Sumi Ink): `#141413` ou `#1c1b18`.
  - Papel não alvejado (Unbleached Paper / Warm Canvas): `#fcfbf7` ou `#ffffeb`.
  - Bordas artesanais (Bookbinder Thread / Muted Stone): `#e6e5d8`.
  - Tons de destaque sofisticados: Verde Floresta / Folha Seca (`#034f46` ou `#1f3d32`), Ocre Dourado / Terracota Suave (`#c27848`), Sálvia e Pergaminho.
- **Tipografia Nobre**:
  - Títulos em fontes serifadas editoriais de proporção clássica (EB Garamond, Newsreader, Instrument Serif ou Playfair Display).
  - Textos de suporte e dados em tipografia humanista e limpa (Plus Jakarta Sans, General Sans), com tracking refinado e entrelinha generosa (1.6x).
  - Nunca quebrar palavras sozinhas em linhas ("viúvas"). Usar travessões verdadeiros (`—`) e aspas tipográficas (`“ ”`).

## 2. Microcópia Literária & Humanizada (Anti-Robô)

- Fale como uma designer e diretora de arte experiente conversando com um autor apaixonado pela sua obra.
- Elimine jargões burocráticos ou mecânicos ("insira os inputs no formulário").
- Exemplos de transformação:
  - *Antes (Mecânico)*: "Preencha a descrição do seu livro para prosseguir."
  - *Depois (Editorial)*: "Compartilhe o coração da sua história. O que faria o leitor parar diante da vitrine e tocar na capa?"
  - *Antes*: "Selecione as opções de gênero abaixo."
  - *Depois*: "Em quais prateleiras o seu livro vai viver?"

## 3. Elementos Físicos & Sensação Tátil

- **Proporções de Livro Real**: Cards de referência e visualizações de capa devem respeitar proporções clássicas (1:1.5 ou 1:1.6).
- **Interações Táteis**:
  - Feedback ao toque: leve compressão física (`transform: scale(0.98)`).
  - Suavização física com curva spring: `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Badges com contornos finos e toque de carimbo editorial.
