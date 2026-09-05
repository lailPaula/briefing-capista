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

    // 1. Create a graceful loading overlay to inform the user
    let overlay = document.getElementById('pdf-export-loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pdf-export-loading-overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.backgroundColor = 'rgba(247, 244, 234, 0.94)';
      overlay.style.backdropFilter = 'blur(8px)';
      overlay.style.webkitBackdropFilter = 'blur(8px)';
      overlay.style.zIndex = '999999';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.gap = '16px';
      overlay.innerHTML = `
        <div style="width: 44px; height: 44px; border: 3px solid #dfd7be; border-top-color: #0e3833; border-radius: 50%; animation: pdfSpin 0.8s linear infinite;"></div>
        <div style="text-align: center;">
          <h3 style="margin: 0; font-family: 'EB Garamond', Georgia, serif; font-size: 22px; color: #141414; font-weight: 600;">Gerando Dossiê Editorial em PDF...</h3>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #5c3a21;">Renderizando páginas, referências e paleta em alta resolução</p>
        </div>
        <style>
          @keyframes pdfSpin { to { transform: rotate(360deg); } }
        </style>
      `;
      document.body.appendChild(overlay);
    }

    // 2. Create the printable container positioned at top: 0, left: 0 under the overlay
    // (Crucial: never place at negative coordinates like -99999px because html2canvas clips it out, generating a blank PDF!)
    const printContainer = document.createElement('div');
    printContainer.id = 'pdf-render-container';
    printContainer.style.position = 'fixed';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '780px';
    printContainer.style.backgroundColor = '#ffffff';
    printContainer.style.color = '#141414';
    printContainer.style.fontFamily = "'Figtree', -apple-system, BlinkMacSystemFont, Arial, sans-serif";
    printContainer.style.padding = '36px 40px';
    printContainer.style.boxSizing = 'border-box';
    printContainer.style.zIndex = '99999'; // Sits right under the loading overlay
    printContainer.style.pointerEvents = 'none';

    const formattedDate = new Date(briefing.createdAt || Date.now()).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Render colors
    let colorsHtml = '';
    if (briefing.colorsMode === 'decide_for_me' || !briefing.colors || briefing.colors.length === 0) {
      colorsHtml = `<span style="font-size: 13px; color: #5c3a21; font-style: italic;">✨ Decisão deixada a critério da Designer</span>`;
    } else {
      colorsHtml = `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 6px;">
          ${briefing.colors.map(c => `
            <div style="display: flex; align-items: center; gap: 6px; background: #fbf9f2; padding: 4px 10px; border-radius: 8px; border: 1px solid #dfd7be;">
              <span style="display: inline-block; width: 18px; height: 18px; border-radius: 4px; background-color: ${c}; border: 1px solid rgba(0,0,0,0.15);"></span>
              <span style="font-size: 12px; font-family: monospace; font-weight: 600; color: #141414;">${c}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Render styles
    const stylesList = briefing.styles || [];
    const stylesHtml = stylesList.length > 0
      ? stylesList.map(s => `<span style="background: #edf6f4; color: #0e3833; padding: 5px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; border: 1px solid rgba(14,56,51,0.25); margin-right: 6px; margin-bottom: 6px; display: inline-block;">${s === 'Outro' && briefing.stylesOther ? `${s}: ${briefing.stylesOther}` : s}</span>`).join('')
      : '<span style="color: #8e7a68; font-size: 13px;">Não especificado</span>';

    // Render images
    let imagesHtml = '';
    if (briefing.images && briefing.images.length > 0) {
      imagesHtml = `
        <div style="margin-top: 14px; display: grid; grid-template-columns: repeat(${Math.min(briefing.images.length, 3)}, 1fr); gap: 14px; page-break-inside: avoid; break-inside: avoid;">
          ${briefing.images.map((img, idx) => `
            <div style="border: 1px solid #dfd7be; border-radius: 10px; overflow: hidden; background: #fbf9f2; padding: 8px; text-align: center; page-break-inside: avoid; break-inside: avoid;">
              <div style="height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 6px; background: #f0ece1;">
                <img src="${img.dataUrl}" crossorigin="anonymous" style="max-height: 100%; max-width: 100%; object-fit: contain;" alt="Referência ${idx + 1}" />
              </div>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #5c3a21; font-weight: 600;">Ref ${idx + 1}: ${img.name || 'Imagem'}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      imagesHtml = `<p style="color: #8e7a68; font-style: italic; font-size: 13px; margin-top: 6px;">Nenhuma imagem de referência anexada pelo cliente.</p>`;
    }

    // Designer notes section
    const notesHtml = briefing.designerNotes
      ? `<div style="margin-top: 20px; background: #edf6f4; border: 1.5px solid rgba(14,56,51,0.25); border-radius: 10px; padding: 16px; page-break-inside: avoid; break-inside: avoid;">
           <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #0e3833; font-weight: 700;">Anotações Internas da Designer</h4>
           <p style="margin: 0; font-size: 13px; color: #141414; line-height: 1.6; white-space: pre-wrap;">${briefing.designerNotes}</p>
         </div>`
      : '';

    printContainer.innerHTML = `
      <!-- Header -->
      <div style="border-bottom: 2px solid #141414; padding-bottom: 18px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid; break-inside: avoid;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="background: #141414; color: #f7f4ea; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.08em;">CAPISTA</span>
            <span style="font-size: 11px; color: #5c3a21; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Dossiê Criativo Editorial</span>
          </div>
          <h1 style="margin: 0; font-size: 26px; font-family: 'EB Garamond', Georgia, serif; color: #141414; letter-spacing: -0.01em;">Briefing de Criação de Capa</h1>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background: #edf6f4; color: #0e3833; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 20px; margin-bottom: 4px; border: 1px solid rgba(14,56,51,0.25);">
            ${briefing.id} • Status: ${briefing.status || 'Novo'}
          </div>
          <div style="font-size: 11px; color: #8e7a68;">Registrado em: ${formattedDate}</div>
        </div>
      </div>

      <!-- Book Info Card -->
      <div style="background: #fbf9f2; border: 1.5px solid #dfd7be; border-radius: 12px; padding: 20px; margin-bottom: 22px; page-break-inside: avoid; break-inside: avoid;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #5c3a21; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 4px;">Título da Obra</div>
            <div style="font-size: 24px; font-weight: 700; color: #141414; font-family: 'EB Garamond', Georgia, serif; line-height: 1.2;">${briefing.bookTitle || 'Sem título'}</div>
            ${briefing.subtitle ? `<div style="font-size: 14px; color: #5c3a21; margin-top: 4px; font-style: italic;">${briefing.subtitle}</div>` : ''}
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #5c3a21; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 4px;">Autor & Gênero</div>
            <div style="font-size: 15px; font-weight: 600; color: #141414;">${briefing.author || 'Autor não informado'}</div>
            <div style="display: inline-block; background: #edf6f4; color: #0e3833; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 12px; margin-top: 6px; border: 1px solid rgba(14,56,51,0.25);">
              ${(briefing.genres && Array.isArray(briefing.genres) && briefing.genres.length > 0)
                ? briefing.genres.map(g => g === 'Outro' && briefing.genreOther ? briefing.genreOther : g).join(' • ')
                : (briefing.genre === 'Outro' && briefing.genreOther ? briefing.genreOther : (briefing.genre || 'Geral'))}
            </div>
          </div>
        </div>

        ${(briefing.contactWhatsApp || briefing.contactEmail) ? `
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #dfd7be; display: flex; gap: 24px; font-size: 12px; color: #5c3a21;">
            ${briefing.contactWhatsApp ? `<div><strong style="color: #141414;">WhatsApp:</strong> ${briefing.contactWhatsApp}</div>` : ''}
            ${briefing.contactEmail ? `<div><strong style="color: #141414;">E-mail:</strong> ${briefing.contactEmail}</div>` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Section: Ideia Principal -->
      <div style="margin-bottom: 22px; page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: #5c3a21; font-weight: 700;">
          💡 Visão & Atmosfera Desejada pelo Autor
        </h3>
        <div style="background: #ffffff; border-left: 4px solid #0e3833; border-top: 1px solid #dfd7be; border-right: 1px solid #dfd7be; border-bottom: 1px solid #dfd7be; border-radius: 0 10px 10px 0; padding: 16px 20px; font-size: 14px; line-height: 1.6; color: #141414; font-style: italic;">
          "${briefing.idea || 'Nenhuma descrição fornecida.'}"
        </div>
      </div>

      <!-- Section: Visual References -->
      <div style="margin-bottom: 22px; page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; color: #5c3a21; font-weight: 700;">
          🖼️ Referências Visuais Selecionadas (${briefing.images ? briefing.images.length : 0} imagem(ns))
        </h3>
        ${imagesHtml}
      </div>

      <!-- Section: Styles & Colors (2 Columns) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; page-break-inside: avoid; break-inside: avoid;">
        <div style="background: #fbf9f2; border: 1.5px solid #dfd7be; border-radius: 10px; padding: 16px;">
          <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #5c3a21; font-weight: 700;">
            🎨 Estilo Visual Escolhido
          </h3>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${stylesHtml}
          </div>
        </div>

        <div style="background: #fbf9f2; border: 1.5px solid #dfd7be; border-radius: 10px; padding: 16px;">
          <h3 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #5c3a21; font-weight: 700;">
            🌈 Paleta & Cores
          </h3>
          ${colorsHtml}
        </div>
      </div>

      <!-- Section: Elemento Indispensável -->
      <div style="margin-bottom: 18px; background: #fbf9f2; border: 1.5px solid #dfd7be; border-radius: 10px; padding: 16px; page-break-inside: avoid; break-inside: avoid;">
        <h3 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #5c3a21; font-weight: 700;">
          ⭐ Elemento Indispensável na Capa
        </h3>
        <p style="margin: 0; font-size: 13px; color: #141414; line-height: 1.5;">
          ${briefing.indispensableNone ? '<em>O cliente marcou: "Não tenho preferência / Fica livre para a designer criar".</em>' : (briefing.indispensable || 'Não especificado.')}
        </p>
      </div>

      ${notesHtml}

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 14px; border-top: 1px solid #dfd7be; display: flex; justify-content: space-between; font-size: 10px; color: #8e7a68; page-break-inside: avoid; break-inside: avoid;">
        <span>Briefing Capista • Ateliê de Direção de Arte & Capas</span>
        <span>Documento confidencial gerado para produção editorial</span>
      </div>
    `;

    document.body.appendChild(printContainer);

    try {
      // 3. Preload all images inside container so html2canvas never renders empty image boxes
      const images = Array.from(printContainer.querySelectorAll('img'));
      if (images.length > 0) {
        await Promise.all(images.map(img => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 2500); // 2.5s timeout safeguard
          });
        }));
      }

      // Small tick to ensure browser layout is stable
      await new Promise(r => setTimeout(r, 120));

      const sanitizedTitle = (briefing.bookTitle || 'Briefing')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 25);
      const filename = `briefing_${briefing.id || 'capa'}_${sanitizedTitle}.pdf`;

      // 4. Check if html2pdf is available
      if (window.html2pdf) {
        const opt = {
          margin: [8, 8, 8, 8],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 780
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Explicitly wait for html2pdf worker promise to complete
        await new Promise((resolve, reject) => {
          window.html2pdf()
            .set(opt)
            .from(printContainer)
            .save()
            .then(resolve)
            .catch(reject);
        });
      } else {
        // Fallback to browser print window
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(`
            <html>
              <head>
                <title>${filename}</title>
                <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Figtree:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
              </head>
              <body style="margin: 0; padding: 24px; background: #fff; color: #141414;">
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
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Houve um erro ao renderizar o PDF diretamente. Abrindo a visualização de impressão como alternativa.');
      window.print();
    } finally {
      // 5. Remove overlay and printContainer safely with a short delay
      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        if (printContainer && printContainer.parentNode) {
          printContainer.parentNode.removeChild(printContainer);
        }
      }, 400);
    }
  }
}

window.PDFExporter = PDFExporter;

