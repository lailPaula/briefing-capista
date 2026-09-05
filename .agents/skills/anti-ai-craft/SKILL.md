---
name: anti-ai-craft
description: Rules, heuristics and audit checks to remove any telltale signs of AI generation from web applications, UI components, and design systems. Use to ensure interfaces feel handcrafted, human-designed, and high-end.
---

# Anti-AI Craft: Guia de Erradicação de Padrões Genéricos de IA

Este guia reúne critérios práticos para auditar e eliminar os "vícios" estéticos e estruturais que fazem uma interface parecer gerada por inteligência artificial genérica ("AI slop").

## 1. O que NUNCA fazer (Vícios Comuns de IA)

1. **A 'palavra solitária em itálico' no título**:
   - *Vício de IA*: `Briefing enviado com <span class="italic">sucesso!</span>` ou `Briefings <span class="italic">Recebidos</span>`.
   - *Correção*: O título deve ter força e elegância como um bloco coeso, sem truques baratos de destacar uma única palavra aleatória em itálico.
2. **Gradientes Roxos/Ciano Neon ou Glow Cyber**:
   - *Vício de IA*: Botões com gradiente `from-indigo-500 to-purple-600` e sombras `shadow-purple-500/50`.
   - *Correção*: Cores orgânicas, botões com presença física (sólido carvão, floresta nobre, ou linho), sombras naturais de luz ambiente real.
3. **Cards Repetitivos e Sem Hierarquia**:
   - *Vício de IA*: 9 caixas idênticas com o mesmo espaçamento e sombra genérica flutuando.
   - *Correção*: Variação de ritmo visual, bordas sutis com relevo, badges informativos com propósito e pesos tipográficos claros.
4. **Textos Genéricos e Robóticos**:
   - *Vício de IA*: "Facilitamos a sua jornada com soluções inteligentes através da nossa plataforma inovadora."
   - *Correção*: Texto humano, direto, acolhedor e com termos reais do cotidiano de autores e designers.
5. **Ícones decorativos soltos sem significado**:
   - *Correção*: Cada ícone deve representar uma ação ou dado concreto, com traço uniforme e tamanho consistente.

## 2. Padrões de Design Autoral & Humano

- **Micro-interações de Resposta Imediata**: Animações curtas (180ms - 260ms), suaves ao toque, com feedback visual nítido de estado ativo.
- **Espaçamento que Respira**: Espaços em branco generosos, permitindo foco e evitando a sensação de formulário sobrecarregado.
- **Acabamento Fino**:
  - Bordas semi-transparentes de 1px (`rgba(0,0,0, 0.06)` ou `#e5e4d8`).
  - Fontes com renderização anti-aliased ativada (`-webkit-font-smoothing: antialiased`).
  - Seleção de texto personalizada harmonizando com a paleta do projeto.
