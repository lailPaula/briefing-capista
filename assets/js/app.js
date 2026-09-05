/**
 * BRIEFING CAPISTA - Main Customer Application Flow
 * Handles step progression, auto-save, interactive cards, drag-and-drop uploads, and summary.
 */

class BriefingApp {
  constructor() {
    this.state = window.briefingState;
    this.currentView = 'client'; // 'client' or 'designer'
  }

  async init() {
    // Check if user has an existing draft
    this.checkDraftBanner();
    this.populateFormFromState();
    this.bindGlobalEvents();
    this.updateProgress();

    // Default to step 0 (welcome)
    this.goToStep(0);
  }

  checkDraftBanner() {
    const draftBanner = document.getElementById('draft-resume-banner');
    if (!draftBanner) return;

    if (this.state.hasDraft()) {
      draftBanner.classList.remove('hidden');
    } else {
      draftBanner.classList.add('hidden');
    }
  }

  resumeDraft() {
    const draft = this.state.loadDraft();
    if (draft && draft.data) {
      this.populateFormFromState();
      const resumeStep = draft.currentStep > 0 && draft.currentStep <= 7 ? draft.currentStep : 1;
      this.goToStep(resumeStep);
      const draftBanner = document.getElementById('draft-resume-banner');
      if (draftBanner) draftBanner.classList.add('hidden');
    }
  }

  discardDraft() {
    this.state.clearDraft();
    this.populateFormFromState();
    const draftBanner = document.getElementById('draft-resume-banner');
    if (draftBanner) draftBanner.classList.add('hidden');
    this.goToStep(0);
  }

  populateFormFromState() {
    const d = this.state.data;

    // Step 1
    const inTitle = document.getElementById('input-book-title');
    const inSubtitle = document.getElementById('input-book-subtitle');
    const inAuthor = document.getElementById('input-author');
    const inGenreOther = document.getElementById('input-genre-other');
    if (inTitle) inTitle.value = d.bookTitle || '';
    if (inSubtitle) inSubtitle.value = d.subtitle || '';
    if (inAuthor) inAuthor.value = d.author || '';
    if (inGenreOther) inGenreOther.value = d.genreOther || '';

    // Genre Cards
    this.updateGenreCardsUI();

    // Step 2
    const inIdea = document.getElementById('textarea-idea');
    if (inIdea) inIdea.value = d.idea || '';

    // Step 3 (Images)
    this.renderImagesPreview();

    // Step 4 (Styles)
    this.updateStylesUI();
    const inStyleOther = document.getElementById('input-style-other');
    if (inStyleOther) inStyleOther.value = d.stylesOther || '';

    // Step 5 (Colors)
    this.updateColorsUI();

    // Step 6 (Indispensable)
    const inIndisp = document.getElementById('input-indispensable');
    if (inIndisp) inIndisp.value = d.indispensable || '';
    this.updateIndispensableUI();

    // Step 7 contacts
    const inWa = document.getElementById('input-contact-whatsapp');
    const inEmail = document.getElementById('input-contact-email');
    if (inWa) inWa.value = d.contactWhatsApp || '';
    if (inEmail) inEmail.value = d.contactEmail || '';
  }

  switchView(viewName) {
    if (viewName === 'designer') {
      if (!window.authService || !window.authService.isAuthenticated()) {
        if (window.authService) window.authService.openLoginModal();
        return;
      }
    }

    this.currentView = viewName;
    const clientView = document.getElementById('view-client');
    const designerView = document.getElementById('view-designer');
    const navClientBtn = document.getElementById('nav-btn-client');
    const navProcessBtn = document.getElementById('nav-btn-process');
    const navDesignerBtn = document.getElementById('nav-btn-designer');

    if (viewName === 'designer') {
      clientView.classList.add('hidden');
      designerView.classList.remove('hidden');
      if (navClientBtn) navClientBtn.classList.remove('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
      if (navProcessBtn) navProcessBtn.classList.remove('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
      if (navDesignerBtn) {
        navDesignerBtn.classList.add('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
        navDesignerBtn.classList.remove('text-[#5c3a21]');
      }
      if (window.authService) window.authService.updateUI();
      window.designerApp.loadBriefings();
    } else {
      designerView.classList.add('hidden');
      clientView.classList.remove('hidden');
      if (navDesignerBtn) {
        navDesignerBtn.classList.remove('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
        navDesignerBtn.classList.add('text-[#5c3a21]');
      }
      if (this.state.currentStep === 'process') {
        if (navClientBtn) navClientBtn.classList.remove('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
        if (navProcessBtn) {
          navProcessBtn.classList.add('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
          navProcessBtn.classList.remove('text-[#5c3a21]');
        }
      } else {
        if (navProcessBtn) {
          navProcessBtn.classList.remove('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
          navProcessBtn.classList.add('text-[#5c3a21]');
        }
        if (navClientBtn) navClientBtn.classList.add('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
      }
    }
  }

  goToStep(stepNumber) {
    if (this.currentView !== 'client') {
      this.switchView('client');
    }

    const previousStep = this.state.currentStep;
    const isBack = stepNumber === 0 || (typeof stepNumber === 'number' && typeof previousStep === 'number' && stepNumber < previousStep);
    const isFirstLoad = previousStep === 0 && stepNumber === 0;
    const animationClass = isFirstLoad ? 'fade-in' : (isBack ? 'page-turn-prev' : 'page-turn-next');

    // Hide all step sections
    for (let i = 0; i <= 8; i++) {
      const el = document.getElementById(`step-section-${i}`);
      if (el) {
        el.classList.add('hidden');
        el.classList.remove('page-turn-next', 'page-turn-prev', 'fade-in');
      }
    }

    // Hide process section
    const processEl = document.getElementById('step-section-process');
    if (processEl) {
      processEl.classList.add('hidden');
      processEl.classList.remove('page-turn-next', 'page-turn-prev', 'fade-in');
    }

    // Show target step
    const targetId = stepNumber === 'process' ? 'step-section-process' : `step-section-${stepNumber}`;
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.remove('hidden');
      void targetEl.offsetWidth; // trigger reflow
      targetEl.classList.add(animationClass);
    }

    // Update navbar active state
    const navClientBtn = document.getElementById('nav-btn-client');
    const navProcessBtn = document.getElementById('nav-btn-process');
    if (stepNumber === 'process') {
      if (navClientBtn) navClientBtn.classList.remove('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
      if (navProcessBtn) {
        navProcessBtn.classList.add('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
        navProcessBtn.classList.remove('text-[#5c3a21]');
      }
    } else {
      if (navProcessBtn) {
        navProcessBtn.classList.remove('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
        navProcessBtn.classList.add('text-[#5c3a21]');
      }
      if (navClientBtn) navClientBtn.classList.add('bg-white', 'text-[#141414]', 'shadow-md', 'font-semibold');
    }

    this.state.currentStep = stepNumber;
    if (typeof stepNumber === 'number') {
      this.state.saveDraft();
    }
    this.updateProgress();

    // If entering summary step (7), build the summary preview
    if (stepNumber === 7) {
      this.renderSummaryReview();
    }

    // Scroll smoothly to top of container
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (window.lucide) window.lucide.createIcons();
  }

  nextStep() {
    const current = this.state.currentStep;
    const validation = this.state.validateStep(current);

    if (!validation.valid) {
      this.showFeedbackMessage(validation.message);
      return;
    }

    if (current < 7) {
      this.goToStep(current + 1);
    }
  }

  prevStep() {
    const current = this.state.currentStep;
    if (current > 1) {
      this.goToStep(current - 1);
    } else if (current === 1) {
      this.goToStep('process');
    }
  }

  updateProgress() {
    const step = this.state.currentStep;
    const progressWrapper = document.getElementById('stepper-progress-wrapper');
    const progressBar = document.getElementById('stepper-progress-bar');
    const stepIndicator = document.getElementById('stepper-step-indicator');
    const stepName = document.getElementById('stepper-step-name');

    if (step === 0 || step === 8 || step === 'process') {
      if (progressWrapper) progressWrapper.classList.add('hidden');
      return;
    }

    if (progressWrapper) progressWrapper.classList.remove('hidden');

    const stepTitles = [
      '',
      'Informações do Livro',
      'O Que Você Imagina?',
      'Referência Visual',
      'Estilo da Capa',
      'Preferência de Cores',
      'O Que Não Pode Faltar',
      'Resumo & Envio'
    ];

    const percentage = Math.round((step / 7) * 100);
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (stepIndicator) stepIndicator.textContent = `Etapa ${step} de 7`;
    if (stepName) stepName.textContent = stepTitles[step] || '';
  }

  showFeedbackMessage(message) {
    const toast = document.getElementById('app-toast');
    const toastMsg = document.getElementById('app-toast-msg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
      toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3500);
  }

  /* ----------------------------------------------------
     STEP 1: Book Info & Genre (Allows multiple selection)
  ---------------------------------------------------- */
  updateGenreCardsUI() {
    const cards = document.querySelectorAll('[data-genre-card]');
    const otherWrapper = document.getElementById('genre-other-wrapper');
    const counterEl = document.getElementById('genre-counter');

    let genres = this.state.data.genres;
    if (!Array.isArray(genres)) {
      genres = this.state.data.genre ? [this.state.data.genre] : [];
      this.state.data.genres = genres;
    }

    cards.forEach(card => {
      const g = card.getAttribute('data-genre-card');
      if (genres.includes(g)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    if (counterEl) {
      if (genres.length > 0) {
        counterEl.textContent = `${genres.length} selecionado${genres.length > 1 ? 's' : ''}`;
        counterEl.classList.remove('hidden');
      } else {
        counterEl.classList.add('hidden');
      }
    }

    if (otherWrapper) {
      if (genres.includes('Outro')) {
        otherWrapper.classList.remove('hidden');
      } else {
        otherWrapper.classList.add('hidden');
      }
    }
  }

  toggleGenre(genre) {
    if (!Array.isArray(this.state.data.genres)) {
      this.state.data.genres = this.state.data.genre ? [this.state.data.genre] : [];
    }

    const index = this.state.data.genres.indexOf(genre);
    if (index > -1) {
      this.state.data.genres.splice(index, 1);
    } else {
      this.state.data.genres.push(genre);
    }

    this.state.data.genre = this.state.data.genres.join(', ');
    this.updateGenreCardsUI();
    this.state.saveDraft();
  }

  selectGenre(genre) {
    this.toggleGenre(genre);
  }

  /* ----------------------------------------------------
     STEP 2: Idea Inspiration Prompts
  ---------------------------------------------------- */
  applyIdeaInspiration(text) {
    const textarea = document.getElementById('textarea-idea');
    if (!textarea) return;

    if (textarea.value.trim() === '') {
      textarea.value = text;
    } else {
      textarea.value = `${textarea.value} ${text}`;
    }
    this.state.data.idea = textarea.value;
    this.state.saveDraft();
    textarea.focus();
    this.showFeedbackMessage('Inspiração adicionada ao seu texto!');
  }

  /* ----------------------------------------------------
     STEP 3: Visual References (Upload & Drag-and-Drop)
  ---------------------------------------------------- */
  async handleFileUpload(files) {
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - this.state.data.images.length;
    if (remainingSlots <= 0) {
      this.showFeedbackMessage('Você já adicionou o limite máximo de 3 imagens de referência.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      if (!validTypes.includes(file.type)) {
        this.showFeedbackMessage(`Formato não suportado para "${file.name}". Use JPG, PNG ou WEBP.`);
        continue;
      }

      if (file.size > 15 * 1024 * 1024) {
        this.showFeedbackMessage(`A imagem "${file.name}" é muito grande (máximo 15MB).`);
        continue;
      }

      const dataUrl = await this.readFileAsDataUrl(file);
      const formattedSize = file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      this.state.data.images.push({
        id: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: file.name,
        dataUrl: dataUrl,
        size: formattedSize
      });
    }

    this.renderImagesPreview();
    this.state.saveDraft();
  }

  readFileAsDataUrl(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  removeImage(index) {
    this.state.data.images.splice(index, 1);
    this.renderImagesPreview();
    this.state.saveDraft();
  }

  renderImagesPreview() {
    const container = document.getElementById('images-preview-grid');
    const countBadge = document.getElementById('images-count-badge');
    if (!container) return;

    const images = this.state.data.images;
    if (countBadge) {
      countBadge.textContent = `${images.length} de 3 imagens`;
      if (images.length === 3) {
        countBadge.className = 'text-xs px-2.5 py-1 rounded-full bg-[#d3ecd7] text-[#0e3833] font-semibold border border-[#0e3833]/30';
      } else {
        countBadge.className = 'text-xs px-2.5 py-1 rounded-full badge-flow text-[#0e3833] font-medium';
      }
    }

    if (images.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-8 text-center text-[#8e7a68] text-xs italic">
          Nenhuma imagem adicionada ainda. Arraste arquivos acima ou selecione do seu dispositivo.
        </div>
      `;
      return;
    }

    container.innerHTML = images.map((img, idx) => `
      <div class="relative group rounded-xl overflow-hidden border border-[#dfd7be] bg-[#fbf9f2] aspect-square flex items-center justify-center shadow-sm">
        <img src="${img.dataUrl}" alt="${img.name}" class="w-full h-full object-cover" />
        
        <!-- Hover actions -->
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 p-2">
          <button type="button" 
                  onclick="window.briefingApp.zoomImage('${img.dataUrl}', '${img.name}')"
                  class="p-2 bg-white/90 text-[#141414] rounded-lg hover:bg-white transition shadow" 
                  title="Ampliar">
            <i data-lucide="maximize-2" class="w-4 h-4"></i>
          </button>
          <button type="button" 
                  onclick="window.briefingApp.removeImage(${idx})"
                  class="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition shadow" 
                  title="Remover">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>

        <span class="absolute bottom-1.5 left-1.5 bg-[#141414]/85 text-[10px] text-[#f7f4ea] px-2 py-0.5 rounded font-mono border border-white/10">
          Ref #${idx + 1}
        </span>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  zoomImage(src, title) {
    window.designerApp.openImageLightbox(src, title);
  }

  /* ----------------------------------------------------
     STEP 4: Style Selection (Max 3)
  ---------------------------------------------------- */
  toggleStyle(styleName) {
    const styles = this.state.data.styles;
    const index = styles.indexOf(styleName);

    if (index > -1) {
      styles.splice(index, 1);
    } else {
      if (styles.length >= 3) {
        this.showFeedbackMessage('Você pode escolher no máximo 3 estilos para manter a capa focada.');
        return;
      }
      styles.push(styleName);
    }

    this.updateStylesUI();
    this.state.saveDraft();
  }

  updateStylesUI() {
    const cards = document.querySelectorAll('[data-style-card]');
    const countEl = document.getElementById('styles-counter');
    const otherWrapper = document.getElementById('style-other-wrapper');
    const current = this.state.data.styles;

    cards.forEach(card => {
      const s = card.getAttribute('data-style-card');
      if (current.includes(s)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    if (countEl) {
      countEl.textContent = `${current.length}/3 selecionados`;
    }

    if (otherWrapper) {
      if (current.includes('Outro')) {
        otherWrapper.classList.remove('hidden');
      } else {
        otherWrapper.classList.add('hidden');
      }
    }
  }

  /* ----------------------------------------------------
     STEP 5: Colors Selection (Max 3 or "Pode decidir por mim")
  ---------------------------------------------------- */
  setColorsMode(mode) {
    this.state.data.colorsMode = mode;
    if (mode === 'decide_for_me') {
      this.state.data.colors = [];
    }
    this.updateColorsUI();
    this.state.saveDraft();
  }

  toggleColor(hex) {
    this.state.data.colorsMode = 'custom';
    const colors = this.state.data.colors;
    const index = colors.indexOf(hex);

    if (index > -1) {
      colors.splice(index, 1);
    } else {
      if (colors.length >= 3) {
        this.showFeedbackMessage('Você pode escolher até 3 cores principais.');
        return;
      }
      colors.push(hex);
    }

    this.updateColorsUI();
    this.state.saveDraft();
  }

  updateColorsUI() {
    const decideCard = document.getElementById('card-color-decide');
    const colorSwatches = document.querySelectorAll('[data-color-hex]');
    const countEl = document.getElementById('colors-counter');
    const customPalette = document.getElementById('colors-palette-section');

    const mode = this.state.data.colorsMode;
    const colors = this.state.data.colors;

    if (mode === 'decide_for_me') {
      if (decideCard) decideCard.classList.add('selected');
      if (countEl) countEl.textContent = 'Decisão do Designer ativada';
      if (customPalette) customPalette.classList.add('opacity-60');
    } else {
      if (decideCard) decideCard.classList.remove('selected');
      if (countEl) countEl.textContent = `${colors.length}/3 cores selecionadas`;
      if (customPalette) customPalette.classList.remove('opacity-60');
    }

    colorSwatches.forEach(swatch => {
      const hex = swatch.getAttribute('data-color-hex');
      if (mode === 'custom' && colors.includes(hex)) {
        swatch.classList.add('ring-2', 'ring-[#0e3833]', 'ring-offset-2', 'ring-offset-[#f7f4ea]', 'scale-105');
      } else {
        swatch.classList.remove('ring-2', 'ring-[#0e3833]', 'ring-offset-2', 'ring-offset-[#f7f4ea]', 'scale-105', 'ring-emerald-400', 'ring-offset-slate-900');
      }
    });
  }

  /* ----------------------------------------------------
     STEP 6: Indispensable Element
  ---------------------------------------------------- */
  toggleIndispensableNone(checkbox) {
    this.state.data.indispensableNone = checkbox.checked;
    const input = document.getElementById('input-indispensable');
    if (input) {
      if (checkbox.checked) {
        input.value = '';
        input.disabled = true;
        input.classList.add('opacity-50', 'bg-[#f6eee7]');
      } else {
        input.disabled = false;
        input.classList.remove('opacity-50', 'bg-[#f6eee7]');
        input.focus();
      }
    }
    this.state.saveDraft();
  }

  applyIndispensablePreset(text) {
    const checkbox = document.getElementById('checkbox-indispensable-none');
    if (checkbox) checkbox.checked = false;
    this.state.data.indispensableNone = false;

    const input = document.getElementById('input-indispensable');
    if (input) {
      input.disabled = false;
      input.classList.remove('opacity-50', 'bg-[#f6eee7]');
      input.value = text;
      this.state.data.indispensable = text;
      input.focus();
    }
    this.state.saveDraft();
  }

  updateIndispensableUI() {
    const checkbox = document.getElementById('checkbox-indispensable-none');
    const input = document.getElementById('input-indispensable');
    if (checkbox && input) {
      checkbox.checked = this.state.data.indispensableNone;
      input.disabled = this.state.data.indispensableNone;
    }
  }

  /* ----------------------------------------------------
     STEP 7: Summary Review
  ---------------------------------------------------- */
  renderSummaryReview() {
    const d = this.state.data;

    // Book Info
    document.getElementById('summary-book-title').textContent = d.bookTitle || 'Sem título';
    const subEl = document.getElementById('summary-book-subtitle');
    if (d.subtitle) {
      subEl.textContent = d.subtitle;
      subEl.style.display = 'block';
    } else {
      subEl.style.display = 'none';
    }
    const genresList = Array.isArray(d.genres) && d.genres.length > 0
      ? d.genres
      : (d.genre ? [d.genre] : []);
    const genreSummaryText = genresList.length > 0
      ? genresList.map(g => g === 'Outro' && d.genreOther ? d.genreOther : g).join(' • ')
      : 'Geral';
    document.getElementById('summary-genre').textContent = genreSummaryText;

    // Idea
    document.getElementById('summary-idea').textContent = d.idea || 'Nenhuma ideia descrita.';

    // References
    const refContainer = document.getElementById('summary-images-grid');
    if (d.images && d.images.length > 0) {
      refContainer.innerHTML = d.images.map((img, idx) => `
        <div class="relative rounded-xl overflow-hidden border border-[#dfd7be] aspect-square bg-[#fbf9f2]">
          <img src="${img.dataUrl}" alt="Ref ${idx + 1}" class="w-full h-full object-cover" />
          <span class="absolute bottom-1 left-1 bg-[#141414]/85 text-[10px] text-[#f7f4ea] px-2 py-0.5 rounded font-mono">Ref #${idx + 1}</span>
        </div>
      `).join('');
    } else {
      refContainer.innerHTML = `
        <div class="col-span-full py-4 text-xs text-[#8e7a68] italic">
          Nenhuma imagem de referência anexada.
        </div>
      `;
    }

    // Styles
    const stylesContainer = document.getElementById('summary-styles-list');
    if (d.styles && d.styles.length > 0) {
      stylesContainer.innerHTML = d.styles.map(s => `
        <span class="badge-flow text-[#0e3833] px-3 py-1 rounded-full text-xs font-medium">
          ${s === 'Outro' && d.stylesOther ? `${s}: ${d.stylesOther}` : s}
        </span>
      `).join('');
    } else {
      stylesContainer.innerHTML = `<span class="text-xs text-[#8e7a68]">Nenhum selecionado</span>`;
    }

    // Colors
    const colorsContainer = document.getElementById('summary-colors-list');
    if (d.colorsMode === 'decide_for_me' || !d.colors || d.colors.length === 0) {
      colorsContainer.innerHTML = `
        <span class="text-xs text-[#0e3833] badge-flow px-3.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
          ✨ Pode decidir por mim (Design livre)
        </span>
      `;
    } else {
      colorsContainer.innerHTML = d.colors.map(c => `
        <div class="flex items-center gap-1.5 bg-[#fbf9f2] px-2.5 py-1 rounded-xl border border-[#dfd7be] text-xs text-[#141414]">
          <span class="w-3.5 h-3.5 rounded-full border border-black/15" style="background-color: ${c}"></span>
          <span class="font-mono text-[11px]">${c}</span>
        </div>
      `).join('');
    }

    // Indispensable
    const indispEl = document.getElementById('summary-indispensable');
    if (d.indispensableNone) {
      indispEl.innerHTML = `<span class="italic text-[#8e7a68]">"Não tenho preferência / Fica livre para o designer."</span>`;
    } else {
      indispEl.textContent = d.indispensable || 'Não especificado.';
    }
  }

  /* ----------------------------------------------------
     SUBMIT BRIEFING
  ---------------------------------------------------- */
  async submitBriefing() {
    const btnSubmit = document.getElementById('btn-submit-briefing');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `
        <span class="flex items-center justify-center gap-2">
          <svg class="animate-spin h-5 w-5 text-[#f7f4ea]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Enviando Briefing...
        </span>
      `;
    }

    // Capture contact values if entered
    const inWa = document.getElementById('input-contact-whatsapp');
    const inEmail = document.getElementById('input-contact-email');
    if (inWa) this.state.data.contactWhatsApp = inWa.value.trim();
    if (inEmail) this.state.data.contactEmail = inEmail.value.trim();

    // Generate unique project ID
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newId = `CAPA-${randomCode}`;

    const newBriefing = {
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...this.state.data,
      status: 'Novo',
      designerNotes: ''
    };

    try {
      await window.db.saveBriefing(newBriefing);
      this.lastSubmittedBriefing = newBriefing;

      // Update success screen details
      document.getElementById('success-briefing-id').textContent = newId;

      // Clear draft
      this.state.clearDraft();

      // Confetti animation
      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Go to success view (Step 8)
      this.goToStep(8);
    } catch (err) {
      console.error('Error saving briefing:', err);
      alert('Houve um problema ao salvar seu briefing. Por favor, tente novamente.');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `ENVIAR BRIEFING <i data-lucide="arrow-right" class="w-5 h-5 ml-1"></i>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  /* ----------------------------------------------------
     Pós-Envio Actions (PDF, WhatsApp, Novo Briefing)
  ---------------------------------------------------- */
  async downloadSuccessPDF() {
    if (this.lastSubmittedBriefing) {
      await window.PDFExporter.exportBriefing(this.lastSubmittedBriefing);
    } else {
      alert('Briefing não localizado para exportação.');
    }
  }

  shareViaWhatsApp() {
    if (!this.lastSubmittedBriefing) return;
    const b = this.lastSubmittedBriefing;
    const text = `Olá! Acabei de enviar o briefing para a capa do livro "${b.bookTitle}" (Código: ${b.id}). Autor: ${b.author}.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  startNewBriefing() {
    this.state.clearDraft();
    this.populateFormFromState();
    this.goToStep(0);
  }

  /* ----------------------------------------------------
     DOM BINDINGS
  ---------------------------------------------------- */
  bindGlobalEvents() {
    // Top Nav buttons
    const btnNavClient = document.getElementById('nav-btn-client');
    const btnNavProcess = document.getElementById('nav-btn-process');
    const btnNavDesigner = document.getElementById('nav-btn-designer');
    if (btnNavClient) btnNavClient.addEventListener('click', () => { this.switchView('client'); this.goToStep(0); });
    if (btnNavProcess) btnNavProcess.addEventListener('click', () => { this.switchView('client'); this.goToStep('process'); });
    if (btnNavDesigner) btnNavDesigner.addEventListener('click', () => this.switchView('designer'));

    // Welcome screen start button
    const btnStart = document.getElementById('btn-start-briefing');
    if (btnStart) btnStart.addEventListener('click', () => this.goToStep('process'));

    // Draft resume buttons
    const btnResume = document.getElementById('btn-resume-draft');
    const btnDiscard = document.getElementById('btn-discard-draft');
    if (btnResume) btnResume.addEventListener('click', () => this.resumeDraft());
    if (btnDiscard) btnDiscard.addEventListener('click', () => this.discardDraft());

    // Book Inputs auto-save
    ['input-book-title', 'input-book-subtitle', 'input-author', 'input-genre-other'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          if (id === 'input-book-title') this.state.data.bookTitle = e.target.value;
          if (id === 'input-book-subtitle') this.state.data.subtitle = e.target.value;
          if (id === 'input-author') this.state.data.author = e.target.value;
          if (id === 'input-genre-other') this.state.data.genreOther = e.target.value;
          this.state.saveDraft();
        });
      }
    });

    // Idea textarea auto-save
    const textareaIdea = document.getElementById('textarea-idea');
    if (textareaIdea) {
      textareaIdea.addEventListener('input', (e) => {
        this.state.data.idea = e.target.value;
        this.state.saveDraft();
      });
    }

    // Drag and Drop Zone for Step 3
    const dropzone = document.getElementById('references-dropzone');
    const fileInput = document.getElementById('input-file-references');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files) {
          this.handleFileUpload(e.dataTransfer.files);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files) {
          this.handleFileUpload(e.target.files);
          fileInput.value = ''; // reset so same file can be re-selected if needed
        }
      });

      // Paste image from clipboard support (Ctrl+V / Cmd+V)
      window.addEventListener('paste', (e) => {
        if (this.state.currentStep === 3 && e.clipboardData && e.clipboardData.files) {
          const files = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
          if (files.length > 0) {
            this.handleFileUpload(files);
            this.showFeedbackMessage('Imagem colada da área de transferência com sucesso!');
          }
        }
      });
    }

    // Color picker input
    const customColorInput = document.getElementById('input-custom-color');
    if (customColorInput) {
      customColorInput.addEventListener('change', (e) => {
        this.toggleColor(e.target.value);
      });
    }

    // Indispensable input
    const indispInput = document.getElementById('input-indispensable');
    if (indispInput) {
      indispInput.addEventListener('input', (e) => {
        this.state.data.indispensable = e.target.value;
        this.state.saveDraft();
      });
    }

    // Other style input
    const styleOtherInput = document.getElementById('input-style-other');
    if (styleOtherInput) {
      styleOtherInput.addEventListener('input', (e) => {
        this.state.data.stylesOther = e.target.value;
        this.state.saveDraft();
      });
    }

    // Submit button
    const btnSubmit = document.getElementById('btn-submit-briefing');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => this.submitBriefing());
    }

    // Success screen buttons
    const btnSuccessPdf = document.getElementById('btn-success-download-pdf');
    const btnSuccessWa = document.getElementById('btn-success-whatsapp');
    const btnSuccessNew = document.getElementById('btn-success-new');
    if (btnSuccessPdf) btnSuccessPdf.addEventListener('click', () => this.downloadSuccessPDF());
    if (btnSuccessWa) btnSuccessWa.addEventListener('click', () => this.shareViaWhatsApp());
    if (btnSuccessNew) btnSuccessNew.addEventListener('click', () => this.startNewBriefing());
  }
}

window.briefingApp = new BriefingApp();
