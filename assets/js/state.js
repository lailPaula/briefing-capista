/**
 * BRIEFING CAPISTA - Form State Management & Auto-Save
 */

const STORAGE_KEY_DRAFT = 'briefing_capista_draft_v1';

class BriefingState {
  constructor() {
    this.currentStep = 0; // 0: Welcome, 1: Livro, 2: Ideia, 3: Ref Visual, 4: Estilo, 5: Cores, 6: Indispensável, 7: Resumo, 8: Sucesso
    this.maxSteps = 7;
    this.data = this.getDefaultData();
    this.loadDraft();
  }

  getDefaultData() {
    return {
      bookTitle: '',
      subtitle: '',
      author: '',
      genres: [], // array of strings (allows multiple genres)
      genre: '', // string for backward compatibility
      genreOther: '',
      idea: '',
      images: [], // array of { id, name, dataUrl, size }
      styles: [], // array of strings (max 3)
      stylesOther: '',
      colorsMode: 'custom', // 'custom' or 'decide_for_me'
      colors: [], // array of hex strings (max 3)
      indispensable: '',
      indispensableNone: false,
      contactWhatsApp: '',
      contactEmail: ''
    };
  }

  saveDraft() {
    try {
      // Keep genre in sync with genres
      if (Array.isArray(this.data.genres)) {
        this.data.genre = this.data.genres.join(', ');
      }
      // Save data without large images to avoid localStorage 5MB quota errors
      // Images will be stored in IndexedDB or handled safely
      const draftToSave = {
        currentStep: this.currentStep,
        data: {
          ...this.data,
          // If images are small, keep them; if they are dataUrls, store meta or compress
          images: this.data.images.map(img => ({
            id: img.id,
            name: img.name,
            size: img.size,
            dataUrl: img.dataUrl.length > 500000 ? '' : img.dataUrl // keep small thumbnails in draft
          }))
        },
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draftToSave));
    } catch (err) {
      console.warn('Could not save draft to localStorage:', err);
    }
  }

  loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data) {
          const d = parsed.data;
          if (!Array.isArray(d.genres)) {
            d.genres = d.genre ? [d.genre] : [];
          }
          this.data = { ...this.getDefaultData(), ...d };
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error loading draft:', err);
    }
    return null;
  }

  hasDraft() {
    const draft = this.loadDraft();
    if (!draft || !draft.data) return false;
    const d = draft.data;
    return !!(d.bookTitle || d.author || d.idea || (d.genres && d.genres.length > 0) || (d.styles && d.styles.length > 0));
  }

  clearDraft() {
    localStorage.removeItem(STORAGE_KEY_DRAFT);
    this.data = this.getDefaultData();
    this.currentStep = 0;
  }

  validateStep(step) {
    switch (step) {
      case 1:
        if (!this.data.bookTitle.trim()) {
          return { valid: false, message: 'Por favor, informe o título do livro.' };
        }
        if (!this.data.author.trim()) {
          return { valid: false, message: 'Por favor, informe o nome do autor.' };
        }
        const hasGenres = (Array.isArray(this.data.genres) && this.data.genres.length > 0) || !!this.data.genre;
        if (!hasGenres) {
          return { valid: false, message: 'Por favor, selecione pelo menos um gênero do livro.' };
        }
        const currentGenres = Array.isArray(this.data.genres) && this.data.genres.length > 0
          ? this.data.genres
          : (this.data.genre ? [this.data.genre] : []);
        if (currentGenres.includes('Outro') && !this.data.genreOther.trim()) {
          return { valid: false, message: 'Por favor, especifique o gênero no campo "Outro".' };
        }
        return { valid: true };

      case 2:
        if (!this.data.idea.trim() || this.data.idea.trim().length < 8) {
          return { valid: false, message: 'Conte um pouco sobre o que você imagina para a capa.' };
        }
        return { valid: true };

      case 3:
        // Imagens de referência são opcionais para não travar o cliente!
        return { valid: true };

      case 4:
        if (this.data.styles.length === 0) {
          return { valid: false, message: 'Selecione pelo menos 1 estilo visual (máximo 3).' };
        }
        if (this.data.styles.includes('Outro') && !this.data.stylesOther.trim()) {
          return { valid: false, message: 'Por favor, descreva o estilo desejado.' };
        }
        return { valid: true };

      case 5:
        if (this.data.colorsMode === 'custom' && this.data.colors.length === 0) {
          return { valid: false, message: 'Escolha até 3 cores ou clique em "Pode decidir por mim".' };
        }
        return { valid: true };

      case 6:
        if (!this.data.indispensableNone && !this.data.indispensable.trim()) {
          return { valid: false, message: 'Informe o elemento indispensável ou marque "Não tenho preferência".' };
        }
        return { valid: true };

      default:
        return { valid: true };
    }
  }
}

window.briefingState = new BriefingState();
