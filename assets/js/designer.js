/**
 * BRIEFING CAPISTA - Designer Admin Dashboard
 * Manages received briefings, status updates, high-res previews, notes and PDF downloads.
 */

class DesignerDashboard {
  constructor() {
    this.briefings = [];
    this.filteredBriefings = [];
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.activeBriefing = null;
  }

  async init() {
    await this.loadBriefings();
    this.bindEvents();
    this.updateMetrics();
  }

  async loadBriefings() {
    try {
      this.briefings = await window.db.getAllBriefings();
      this.applyFilters();
    } catch (err) {
      console.error('Error loading briefings:', err);
    }
  }

  applyFilters() {
    let result = [...this.briefings];

    if (this.currentFilter !== 'all') {
      result = result.filter(b => b.status === this.currentFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(b =>
        (b.bookTitle && b.bookTitle.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.genre && b.genre.toLowerCase().includes(q)) ||
        (Array.isArray(b.genres) && b.genres.some(g => g.toLowerCase().includes(q))) ||
        (b.genreOther && b.genreOther.toLowerCase().includes(q)) ||
        (b.id && b.id.toLowerCase().includes(q))
      );
    }

    this.filteredBriefings = result;
    this.renderCards();
    this.updateMetrics();
  }

  setFilter(status) {
    this.currentFilter = status;
    const filterButtons = document.querySelectorAll('[data-filter-status]');
    filterButtons.forEach(btn => {
      const s = btn.getAttribute('data-filter-status');
      if (s === status) {
        btn.classList.remove('bg-white', 'text-[#5c3a21]', 'border', 'border-[#dfd7be]');
        btn.classList.add('bg-[#141414]', 'text-[#f7f4ea]', 'font-semibold', 'shadow-sm');
      } else {
        btn.classList.remove('bg-[#141414]', 'text-[#f7f4ea]', 'font-semibold', 'shadow-sm');
        btn.classList.add('bg-white', 'text-[#5c3a21]', 'border', 'border-[#dfd7be]');
      }
    });
    this.applyFilters();
  }

  updateMetrics() {
    const total = this.briefings.length;
    const novos = this.briefings.filter(b => b.status === 'Novo').length;
    const emProducao = this.briefings.filter(b => b.status === 'Em produção' || b.status === 'Em análise').length;
    const finalizados = this.briefings.filter(b => b.status === 'Finalizado').length;

    const elTotal = document.getElementById('metric-total');
    const elNovos = document.getElementById('metric-novos');
    const elProducao = document.getElementById('metric-producao');
    const elFinalizados = document.getElementById('metric-finalizados');

    if (elTotal) elTotal.textContent = total;
    if (elNovos) elNovos.textContent = novos;
    if (elProducao) elProducao.textContent = emProducao;
    if (elFinalizados) elFinalizados.textContent = finalizados;
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Novo':
        return 'bg-[#edf6f4] text-[#0e3833] border border-[#0e3833]/20';
      case 'Em análise':
        return 'bg-[#eff6ff] text-[#1e40af] border border-[#1e40af]/20';
      case 'Em produção':
        return 'bg-[#d3ecd7] text-[#0e3833] border border-[#0e3833]/30';
      case 'Aguardando cliente':
        return 'bg-[#fffbeb] text-[#92400e] border border-[#92400e]/20';
      case 'Finalizado':
        return 'bg-[#f0fdf4] text-[#166534] border border-[#166534]/20';
      default:
        return 'bg-[#f6eee7] text-[#5c3a21] border border-[#dfd7be]';
    }
  }

  formatGenre(b) {
    if (b.genres && Array.isArray(b.genres) && b.genres.length > 0) {
      return b.genres.map(g => g === 'Outro' && b.genreOther ? `Outro (${b.genreOther})` : g).join(' • ');
    }
    return b.genre === 'Outro' && b.genreOther ? `Outro (${b.genreOther})` : (b.genre || 'Geral');
  }

  renderCards() {
    const container = document.getElementById('designer-cards-grid');
    if (!container) return;

    if (this.filteredBriefings.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-[#5c3a21] flow-card rounded-2xl p-8 border border-[#dfd7be] bg-white">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fbf9f2] flex items-center justify-center text-[#5c3a21] border border-[#dfd7be]">
            <i data-lucide="inbox" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-semibold text-[#141414] mb-1 font-serif-title">Nenhum briefing encontrado</h3>
          <p class="text-sm text-[#5c3a21] max-w-md mx-auto">
            ${this.searchQuery ? 'Nenhum resultado corresponde à sua pesquisa.' : 'Nenhum briefing com o status selecionado.'}
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = this.filteredBriefings.map(b => {
      const dateStr = new Date(b.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const hasImages = b.images && b.images.length > 0;
      const thumbUrl = hasImages ? b.images[0].dataUrl : null;
      const genreName = this.formatGenre(b);

      return `
        <div class="flow-card rounded-2xl p-5 border border-[#dfd7be] bg-white flex flex-col justify-between cursor-pointer transition-all relative group shadow-sm hover:shadow-md hover:border-[#0e3833]"
             onclick="window.designerApp.openDetailModal('${b.id}')">
          
          <div>
            <!-- Top row: Status & ID -->
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[11px] font-mono tracking-wider text-[#5c3a21] font-semibold bg-[#fbf9f2] border border-[#dfd7be] px-2 py-0.5 rounded">
                ${b.id}
              </span>
              <span class="text-xs px-2.5 py-1 rounded-full font-medium ${this.getStatusBadgeClass(b.status)}">
                ${b.status || 'Novo'}
              </span>
            </div>

            <!-- Title & Subtitle -->
            <h3 class="text-lg font-bold text-[#141414] font-serif-title leading-snug group-hover:text-[#0e3833] transition-colors line-clamp-2 mb-1">
              ${b.bookTitle || 'Sem título'}
            </h3>
            ${b.subtitle ? `<p class="text-xs text-[#5c3a21] italic line-clamp-1 mb-2">"${b.subtitle}"</p>` : ''}

            <!-- Author & Genre -->
            <div class="flex items-center gap-2 text-xs text-[#5c3a21] mb-4 mt-2">
              <span class="font-medium text-[#0e3833] flex items-center gap-1">
                <i data-lucide="user" class="w-3.5 h-3.5"></i>
                ${b.author || 'Autor não informado'}
              </span>
              <span class="text-[#d5d5be]">•</span>
              <span class="bg-[#fbf9f2] text-[#5c3a21] border border-[#dfd7be] px-2 py-0.5 rounded text-[11px]">
                ${genreName}
              </span>
            </div>

            <!-- Snippet of Idea -->
            <p class="text-xs text-[#5c3a21] line-clamp-2 mb-4 bg-[#fbf9f2] p-2.5 rounded-xl border border-[#dfd7be] italic">
              "${b.idea || 'Sem descrição'}"
            </p>
          </div>

          <!-- Bottom: Images preview & Date -->
          <div class="pt-3 border-t border-[#dfd7be] flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              ${hasImages ? `
                <div class="flex -space-x-2 overflow-hidden">
                  ${b.images.slice(0, 3).map((img, i) => `
                    <div class="inline-block h-8 w-8 rounded-md ring-2 ring-white overflow-hidden bg-[#fbf9f2] border border-[#dfd7be]">
                      <img src="${img.dataUrl}" alt="Ref" class="h-full w-full object-cover" />
                    </div>
                  `).join('')}
                </div>
                <span class="text-[11px] text-[#5c3a21] ml-1 font-medium">${b.images.length} ref${b.images.length > 1 ? 's' : ''}</span>
              ` : `
                <span class="text-[11px] text-[#8e7a68] italic">Sem imagens</span>
              `}
            </div>

            <div class="text-[11px] text-[#8e7a68] flex items-center gap-1">
              <i data-lucide="clock" class="w-3 h-3 text-[#8e7a68]"></i>
              ${dateStr}
            </div>
          </div>

        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async openDetailModal(id) {
    const briefing = await window.db.getBriefing(id);
    if (!briefing) return;
    this.activeBriefing = briefing;

    const modal = document.getElementById('briefing-detail-modal');
    if (!modal) return;

    // Fill Modal Data
    document.getElementById('modal-book-title').textContent = briefing.bookTitle || 'Sem título';
    document.getElementById('modal-book-subtitle').textContent = briefing.subtitle || '';
    document.getElementById('modal-book-subtitle').style.display = briefing.subtitle ? 'block' : 'none';
    document.getElementById('modal-author').textContent = briefing.author || 'Autor não informado';
    
    const genreText = this.formatGenre(briefing);
    document.getElementById('modal-genre').textContent = genreText;
    document.getElementById('modal-id').textContent = briefing.id;
    document.getElementById('modal-date').textContent = new Date(briefing.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Idea
    document.getElementById('modal-idea').textContent = briefing.idea || 'Sem descrição da ideia.';

    // References Images
    const imagesContainer = document.getElementById('modal-images-grid');
    if (briefing.images && briefing.images.length > 0) {
      imagesContainer.innerHTML = briefing.images.map((img, idx) => `
        <div class="relative group rounded-xl overflow-hidden border border-[#dfd7be] bg-[#fbf9f2] aspect-square flex items-center justify-center cursor-pointer shadow-sm"
             onclick="window.designerApp.openImageLightbox('${img.dataUrl}', '${img.name || 'Referência ' + (idx + 1)}')">
          <img src="${img.dataUrl}" alt="Ref ${idx + 1}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span class="bg-black/70 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i> Ampliar
            </span>
          </div>
          <span class="absolute bottom-2 left-2 bg-[#141414]/80 text-[10px] text-[#f7f4ea] px-2 py-0.5 rounded font-medium border border-white/10">
            Ref #${idx + 1}
          </span>
        </div>
      `).join('');
    } else {
      imagesContainer.innerHTML = `
        <div class="col-span-full py-8 text-center text-[#5c3a21] bg-[#fbf9f2] rounded-xl border border-[#dfd7be]">
          <i data-lucide="image-off" class="w-8 h-8 mx-auto mb-2 text-[#8e7a68]"></i>
          <p class="text-sm">Nenhuma imagem de referência enviada pelo autor.</p>
        </div>
      `;
    }

    // Styles
    const stylesContainer = document.getElementById('modal-styles-list');
    if (briefing.styles && briefing.styles.length > 0) {
      stylesContainer.innerHTML = briefing.styles.map(s => `
        <span class="badge-flow text-[#0e3833] px-3 py-1 rounded-full text-xs font-medium">
          ${s === 'Outro' && briefing.stylesOther ? `${s}: ${briefing.stylesOther}` : s}
        </span>
      `).join('');
    } else {
      stylesContainer.innerHTML = `<span class="text-[#8e7a68] text-xs italic">Não informado</span>`;
    }

    // Colors
    const colorsContainer = document.getElementById('modal-colors-list');
    if (briefing.colorsMode === 'decide_for_me' || !briefing.colors || briefing.colors.length === 0) {
      colorsContainer.innerHTML = `
        <span class="text-xs badge-flow text-[#0e3833] px-3.5 py-1 rounded-full flex items-center gap-1.5">
          ✨ Pode decidir por mim (Livre para o designer)
        </span>
      `;
    } else {
      colorsContainer.innerHTML = briefing.colors.map(c => `
        <div class="flex items-center gap-2 bg-[#fbf9f2] px-2.5 py-1 rounded-lg border border-[#dfd7be]">
          <span class="w-4 h-4 rounded-full border border-black/15" style="background-color: ${c}"></span>
          <span class="font-mono text-xs text-[#141414]">${c}</span>
        </div>
      `).join('');
    }

    // Indispensable
    const indispEl = document.getElementById('modal-indispensable');
    if (briefing.indispensableNone) {
      indispEl.innerHTML = `<span class="text-[#8e7a68] italic">"Não tenho preferência / Criação livre."</span>`;
    } else {
      indispEl.textContent = briefing.idea ? briefing.indispensable : 'Não especificado';
    }

    // Contacts
    const contactBox = document.getElementById('modal-contacts-box');
    const contactWa = document.getElementById('modal-contact-whatsapp');
    const contactMail = document.getElementById('modal-contact-email');
    if (briefing.contactWhatsApp || briefing.contactEmail) {
      contactBox.style.display = 'block';
      contactWa.textContent = briefing.contactWhatsApp || '-';
      contactMail.textContent = briefing.contactEmail || '-';
    } else {
      contactBox.style.display = 'none';
    }

    // Status Select
    const statusSelect = document.getElementById('modal-status-select');
    if (statusSelect) statusSelect.value = briefing.status || 'Novo';

    // Designer Notes
    const notesInput = document.getElementById('modal-designer-notes');
    if (notesInput) notesInput.value = briefing.designerNotes || '';

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }

  closeDetailModal() {
    const modal = document.getElementById('briefing-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.activeBriefing = null;
  }

  openImageLightbox(src, title) {
    const lb = document.getElementById('image-lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    if (!lb || !img) return;

    img.src = src;
    if (caption) caption.textContent = title || 'Visualização da Referência';
    lb.classList.remove('hidden');
    lb.classList.add('flex');
  }

  closeImageLightbox() {
    const lb = document.getElementById('image-lightbox');
    if (lb) {
      lb.classList.add('hidden');
      lb.classList.remove('flex');
    }
  }

  async handleStatusChange(newStatus) {
    if (!this.activeBriefing) return;
    try {
      await window.db.updateBriefingStatus(this.activeBriefing.id, newStatus);
      this.activeBriefing.status = newStatus;
      await this.loadBriefings();
      this.showToast(`Status atualizado para "${newStatus}"!`);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status.');
    }
  }

  async handleSaveNotes() {
    if (!this.activeBriefing) return;
    const notesInput = document.getElementById('modal-designer-notes');
    const notes = notesInput ? notesInput.value : '';
    try {
      await window.db.updateBriefingNotes(this.activeBriefing.id, notes);
      this.activeBriefing.designerNotes = notes;
      await this.loadBriefings();
      this.showToast('Anotações salvas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar anotações.');
    }
  }

  async handleDeleteActiveBriefing() {
    if (!this.activeBriefing) return;
    const confirmDelete = confirm(`Tem certeza que deseja excluir o briefing "${this.activeBriefing.bookTitle}"?`);
    if (!confirmDelete) return;

    try {
      await window.db.deleteBriefing(this.activeBriefing.id);
      this.closeDetailModal();
      await this.loadBriefings();
      this.showToast('Briefing excluído com sucesso.');
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir briefing.');
    }
  }

  async downloadActivePDF() {
    if (!this.activeBriefing) return;
    await window.PDFExporter.exportBriefing(this.activeBriefing);
  }

  copyActiveBriefingText() {
    if (!this.activeBriefing) return;
    const b = this.activeBriefing;
    const text = `📖 *BRIEFING DE CAPA - ${b.id}*
-----------------------------
📚 *Livro:* ${b.bookTitle} ${b.subtitle ? `\n🖋️ *Subtítulo:* ${b.subtitle}` : ''}
👤 *Autor:* ${b.author}
🏷️ *Gênero:* ${this.formatGenre(b)}

💡 *Ideia para a Capa:*
"${b.idea}"

🎨 *Estilo:* ${b.styles && b.styles.length > 0 ? b.styles.join(', ') : 'Não informado'}
🌈 *Cores:* ${b.colorsMode === 'decide_for_me' ? 'A critério do designer' : (b.colors ? b.colors.join(', ') : 'Não informado')}
⭐ *Indispensável:* ${b.indispensableNone ? 'Sem preferência (livre)' : b.indispensable}

📱 *WhatsApp:* ${b.contactWhatsApp || 'Não informado'}
✉️ *E-mail:* ${b.contactEmail || 'Não informado'}
-----------------------------`;

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Briefing copiado para a área de transferência!');
    }).catch(() => {
      alert('Não foi possível copiar automaticamente.');
    });
  }

  showToast(message) {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('app-toast-msg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3200);
  }

  bindEvents() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('[data-filter-status]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => {
          b.classList.remove('bg-[#141414]', 'text-[#f7f4ea]', 'font-semibold', 'shadow-sm');
          b.classList.add('bg-white', 'text-[#5c3a21]', 'border', 'border-[#dfd7be]');
        });
        btn.classList.remove('bg-white', 'text-[#5c3a21]', 'border', 'border-[#dfd7be]');
        btn.classList.add('bg-[#141414]', 'text-[#f7f4ea]', 'font-semibold', 'shadow-sm');

        this.currentFilter = btn.getAttribute('data-filter-status');
        this.applyFilters();
      });
    });

    // Search input
    const searchInput = document.getElementById('designer-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
      });
    }

    // Modal status change
    const modalStatus = document.getElementById('modal-status-select');
    if (modalStatus) {
      modalStatus.addEventListener('change', (e) => {
        this.handleStatusChange(e.target.value);
      });
    }

    // Save notes button
    const btnSaveNotes = document.getElementById('modal-btn-save-notes');
    if (btnSaveNotes) {
      btnSaveNotes.addEventListener('click', () => {
        this.handleSaveNotes();
      });
    }

    // Download PDF
    const btnPdf = document.getElementById('modal-btn-download-pdf');
    if (btnPdf) {
      btnPdf.addEventListener('click', () => {
        this.downloadActivePDF();
      });
    }

    // Copy text
    const btnCopy = document.getElementById('modal-btn-copy-text');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        this.copyActiveBriefingText();
      });
    }

    // Delete
    const btnDelete = document.getElementById('modal-btn-delete');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        this.handleDeleteActiveBriefing();
      });
    }

    // Close detail modal
    const btnCloseModal = document.getElementById('modal-btn-close');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => {
        this.closeDetailModal();
      });
    }

    // Close lightbox
    const btnCloseLightbox = document.getElementById('lightbox-btn-close');
    if (btnCloseLightbox) {
      btnCloseLightbox.addEventListener('click', () => {
        this.closeImageLightbox();
      });
    }
  }
}

window.designerApp = new DesignerDashboard();
