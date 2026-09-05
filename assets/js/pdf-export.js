/**
 * BRIEFING CAPISTA - PDF Export Engine
 * Generates an elegant, high-standard editorial dossier for book cover production.
 */

class PDFExporter {
  static async exportBriefing(briefing) {
    if (!briefing) {
      alert('Nenhum briefing selecionado para exportar.');
      return;
    }

    // Create a temporary hidden container with print styling
    const printContainer = document.createElement('div');
    printContainer.id = 'pdf-render-container';
    printContainer.style.position = 'fixed';
    printContainer.style.top = '-99999px';
    printContainer.style.left = '-99999px';
    printContainer.style.width = '800px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.color = '#141414';
    printContainer.style.fontFamily = "'Figtree', Arial, sans-serif";
    printContainer.style.padding = '40px';
    printContainer.style.boxSizing = 'border-box';

    const formattedDate = new Date(briefing.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Render colors
    let colorsHtml = '';
    if (briefing.colorsMode === 'decide_for_me' || !briefing.colors || briefing.colors.length === 0) {
      colorsHtml = `<span style="font-size: 13px; color: #555; font-style: italic;">✨ Decisão deixada a critério do Designer</span>`;
    } else {
      colorsHtml = `
        <div style="display: flex; gap: 12px; align-items: center; margin-top: 6px;">
          ${briefing.colors.map(c => `
            <div style="display: flex; align-items: center; gap: 6px; background: #f4f4f5; padding: 4px 10px; border-radius: 6px; border: 1px solid #e4e4e7;">
              <span style="display: inline-block; width: 18px; height: 18px; border-radius: 4px; background-color: ${c}; border: 1px solid rgba(0,0,0,0.15);"></span>
              <span style="font-size: 12px; font-family: monospace; font-weight: 600; color: #333;">${c}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Render styles
    const stylesList = briefing.styles || [];
    const stylesHtml = stylesList.length > 0
      ? stylesList.map(s => `<span style="background: #f1f5f9; color: #0f172a; padding: 5px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; border: 1px solid #cbd5e1; margin-right: 6px;">${s === 'Outro' && briefing.stylesOther ? `${s}: ${briefing.stylesOther}` : s}</span>`).join('')
      : '<span style="color: #666; font-size: 13px;">Não especificado</span>';

    // Render images
    let imagesHtml = '';
    if (briefing.images && briefing.images.length > 0) {
      imagesHtml = `
        <div style="margin-top: 14px; display: grid; grid-template-columns: repeat(${Math.min(briefing.images.length, 3)}, 1fr); gap: 14px;">
          ${briefing.images.map((img, idx) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #f8fafc; padding: 6px; text-align: center;">
              <div style="height: 190px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 4px; background: #eee;">
                <img src="${img.dataUrl}" style="max-height: 100%; max-width: 100%; object-fit: contain;" alt="Referência ${idx + 1}" />
              </div>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b; font-weight: 500;">Ref ${idx + 1}: ${img.name || 'Imagem'}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      imagesHtml = `<p style="color: #94a3b8; font-style: italic; font-size: 13px; margin-top: 6px;">Nenhuma imagem de referência anexada pelo cliente.</p>`;
    }

    // Designer notes section
    const notesHtml = briefing.designerNotes
      ? `<div style="margin-top: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px;">
           <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #166534; font-weight: 700;">Anotações Internas do Designer</h4>
           <p style="margin: 0; font-size: 13px; color: #14532d; line-height: 1.5; white-space: pre-wrap;">${briefing.designerNotes}</p>
         </div>`
      : '';

    printContainer.innerHTML = `
      <!-- Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="background: #08090b; color: #10b981; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.08em; border: 1px solid rgba(16,185,129,0.3);">CAPISTA</span>
            <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Ficha Técnica Editorial</span>
          </div>
          <h1 style="margin: 0; font-size: 26px; font-family: 'EB Garamond', Georgia, serif; color: #0f172a; letter-spacing: -0.01em;">Briefing de Criação de Capa</h1>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background: #ecfdf5; color: #065f46; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 20px; margin-bottom: 4px; border: 1px solid #a7f3d0;">
            ${briefing.id} • Status: ${briefing.status || 'Novo'}
          </div>
          <div style="font-size: 11px; color: #64748b;">Enviado em: ${formattedDate}</div>
        </div>
      </div>

      <!-- Book Info Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px;">Título do Livro</div>
            <div style="font-size: 22px; font-weight: 600; color: #0f172a; font-family: 'EB Garamond', Georgia, serif;">${briefing.bookTitle || 'Sem título'}</div>
            ${briefing.subtitle ? `<div style="font-size: 14px; color: #475569; margin-top: 3px; font-style: italic;">${briefing.subtitle}</div>` : ''}
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px;">Autor & Gênero</div>
            <div style="font-size: 15px; font-weight: 600; color: #0f172a;">${briefing.author || 'Autor não informado'}</div>
            <div style="display: inline-block; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 12px; margin-top: 4px; border: 1px solid #a7f3d0;">
              ${(briefing.genres && Array.isArray(briefing.genres) && briefing.genres.length > 0)
                ? briefing.genres.map(g => g === 'Outro' && briefing.genreOther ? briefing.genreOther : g).join(' • ')
                : (briefing.genre === 'Outro' && briefing.genreOther ? briefing.genreOther : (briefing.genre || 'Geral'))}
            </div>
          </div>
        </div>

        ${(briefing.contactWhatsApp || briefing.contactEmail) ? `
          <div style="margin-top: 14px; pt-3; border-top: 1px solid #e2e8f0; display: flex; gap: 20px; font-size: 12px; color: #475569;">
            ${briefing.contactWhatsApp ? `<div><strong>WhatsApp:</strong> ${briefing.contactWhatsApp}</div>` : ''}
            ${briefing.contactEmail ? `<div><strong>E-mail:</strong> ${briefing.contactEmail}</div>` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Section: Ideia Principal -->
      <div style="margin-bottom: 22px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: 700;">
          💡 O que o autor imagina para a capa
        </h3>
        <div style="background: #ffffff; border-left: 4px solid #10b981; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; border-radius: 0 8px 8px 0; padding: 14px 18px; font-size: 14px; line-height: 1.6; color: #1e293b; font-style: italic;">
          "${briefing.idea || 'Nenhuma descrição fornecida.'}"
        </div>
      </div>

      <!-- Section: Visual References -->
      <div style="margin-bottom: 22px;">
        <h3 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: 700;">
          🖼️ Referências Visuais Enviadas (${briefing.images ? briefing.images.length : 0} imagem(ns))
        </h3>
        ${imagesHtml}
      </div>

      <!-- Section: Styles & Colors (2 Columns) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
          <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: 700;">
            🎨 Estilo Visual Escolhido
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${stylesHtml}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
          <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: 700;">
            🌈 Preferência de Cores
          </h3>
          ${colorsHtml}
        </div>
      </div>

      <!-- Section: Elemento Indispensável -->
      <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
        <h3 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: 700;">
          ⭐ Elemento Indispensável na Capa
        </h3>
        <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5;">
          ${briefing.indispensableNone ? '<em>O cliente marcou: "Não tenho preferência / Fica livre para o designer criar".</em>' : (briefing.indispensable || 'Não especificado.')}
        </p>
      </div>

      ${notesHtml}

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 14px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
        <span>Briefing Capista • Sistema de Alinhamento Criativo Editorial</span>
        <span>Documento confidencial gerado para produção de capa</span>
      </div>
    `;

    document.body.appendChild(printContainer);

    try {
      const sanitizedTitle = (briefing.bookTitle || 'Briefing')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 25);
      const filename = `briefing_${briefing.id || 'capa'}_${sanitizedTitle}.pdf`;

      // Check if html2pdf is available
      if (window.html2pdf) {
        const opt = {
          margin: [10, 10, 10, 10],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await window.html2pdf().set(opt).from(printContainer).save();
      } else {
        // Fallback to browser print window
        const printWin = window.open('', '_blank');
        printWin.document.write(`
          <html>
            <head>
              <title>${filename}</title>
              <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
            </head>
            <body style="margin: 0; padding: 20px;">
              ${printContainer.innerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                }
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Erro ao gerar o PDF. Uma janela de impressão foi aberta como alternativa.');
      window.print();
    } finally {
      document.body.removeChild(printContainer);
    }
  }
}

window.PDFExporter = PDFExporter;
