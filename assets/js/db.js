/**
 * BRIEFING CAPISTA - Database layer with IndexedDB & LocalStorage fallback
 * Handles storage of briefings and high-resolution reference images safely and non-blocking.
 */

const DB_NAME = 'BriefingCapistaDB';
const DB_VERSION = 1;
const STORE_NAME = 'briefings';
const BACKUP_STORAGE_KEY = 'briefing_capista_items_backup';

class DatabaseManager {
  constructor() {
    this.db = null;
    this.useFallback = false;
    this.initPromise = this.init();
  }

  async init() {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported, using LocalStorage fallback');
      this.useFallback = true;
      this.checkAndSeedFallbackData();
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('author', 'author', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
          // Seed asynchronously after resolving connection to prevent deadlocks
          setTimeout(() => {
            this.checkAndSeedData().catch(err => console.warn('Seed data note:', err));
          }, 50);
        };

        request.onerror = (event) => {
          console.warn('IndexedDB open error, falling back to LocalStorage:', event.target.error);
          this.useFallback = true;
          this.checkAndSeedFallbackData();
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB exception, falling back to LocalStorage:', err);
        this.useFallback = true;
        this.checkAndSeedFallbackData();
        resolve(null);
      }
    });
  }

  async ready() {
    if (this.db || this.useFallback) return this.db;
    return this.initPromise;
  }

  /* ----------------------------------------------------
     Fallback LocalStorage Operations
  ---------------------------------------------------- */
  getFallbackList() {
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveFallbackList(list) {
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage quota reached:', e);
    }
  }

  checkAndSeedFallbackData() {
    const list = this.getFallbackList();
    if (list.length === 0) {
      const seeds = this.getSeedItems();
      this.saveFallbackList(seeds);
    }
  }

  /* ----------------------------------------------------
     Database Operations (IndexedDB with Fallback)
  ---------------------------------------------------- */
  async saveBriefing(briefing) {
    await this.ready();

    if (this.useFallback || !this.db) {
      const list = this.getFallbackList();
      const idx = list.findIndex(b => b.id === briefing.id);
      if (idx >= 0) {
        list[idx] = briefing;
      } else {
        list.unshift(briefing);
      }
      this.saveFallbackList(list);
      return briefing;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(briefing);

        request.onsuccess = () => resolve(briefing);
        request.onerror = () => {
          // If transaction fails, fallback to localStorage
          this.useFallback = true;
          this.saveBriefing(briefing).then(resolve).catch(reject);
        };
      } catch (e) {
        this.useFallback = true;
        this.saveBriefing(briefing).then(resolve).catch(reject);
      }
    });
  }

  async getBriefing(id) {
    await this.ready();

    if (this.useFallback || !this.db) {
      const list = this.getFallbackList();
      return list.find(b => b.id === id) || null;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => {
          const list = this.getFallbackList();
          resolve(list.find(b => b.id === id) || null);
        };
      } catch (e) {
        const list = this.getFallbackList();
        resolve(list.find(b => b.id === id) || null);
      }
    });
  }

  async getAllBriefings() {
    await this.ready();

    if (this.useFallback || !this.db) {
      const list = this.getFallbackList();
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return list;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const list = request.result || [];
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          resolve(list);
        };
        request.onerror = () => {
          const list = this.getFallbackList();
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          resolve(list);
        };
      } catch (e) {
        const list = this.getFallbackList();
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(list);
      }
    });
  }

  async updateBriefingStatus(id, newStatus) {
    const briefing = await this.getBriefing(id);
    if (!briefing) throw new Error('Briefing não encontrado');
    briefing.status = newStatus;
    briefing.updatedAt = new Date().toISOString();
    return this.saveBriefing(briefing);
  }

  async updateBriefingNotes(id, notes) {
    const briefing = await this.getBriefing(id);
    if (!briefing) throw new Error('Briefing não encontrado');
    briefing.designerNotes = notes;
    briefing.updatedAt = new Date().toISOString();
    return this.saveBriefing(briefing);
  }

  async deleteBriefing(id) {
    await this.ready();

    if (this.useFallback || !this.db) {
      let list = this.getFallbackList();
      list = list.filter(b => b.id !== id);
      this.saveFallbackList(list);
      return true;
    }

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          let list = this.getFallbackList();
          list = list.filter(b => b.id !== id);
          this.saveFallbackList(list);
          resolve(true);
        };
      } catch (e) {
        let list = this.getFallbackList();
        list = list.filter(b => b.id !== id);
        this.saveFallbackList(list);
        resolve(true);
      }
    });
  }

  getSeedItems() {
    return [
      {
        id: 'CAPA-1082',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        bookTitle: 'O Silêncio dos Corvos',
        subtitle: 'As Crônicas do Reino Esquecido',
        author: 'Helena Montenegro',
        genre: 'Fantasia',
        idea: 'Quero uma capa elegante, escura e misteriosa, com um corvo pousado sobre uma coroa de prata caída na neve. O clima deve ser de mistério e nobreza decadente, com névoa sutil e iluminação lunar.',
        styles: ['Misterioso', 'Elegante', 'Dramático'],
        colorsMode: 'custom',
        colors: ['#0f172a', '#94a3b8', '#c99e52'],
        indispensable: 'Uma coroa de prata antiga com pequenas gemas e a silhueta do corvo em destaque.',
        indispensableNone: false,
        contactWhatsApp: '(11) 98765-4321',
        contactEmail: 'helena.autora@exemplo.com',
        status: 'Novo',
        designerNotes: 'Ideia muito visual e rica. Explorar contraste do brilho lunar na coroa com o fundo azul petróleo profundo.',
        images: [
          {
            id: 'sample_img_1',
            name: 'referencia_corvo_neve.jpg',
            dataUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=600&auto=format&fit=crop',
            size: '340 KB'
          },
          {
            id: 'sample_img_2',
            name: 'estilo_coroa_minimalista.jpg',
            dataUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=600&auto=format&fit=crop',
            size: '420 KB'
          }
        ]
      },
      {
        id: 'CAPA-0947',
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        bookTitle: 'Mente Focada, Vida Leve',
        subtitle: 'Como Silenciar o Ruído Mental e Realizar com Clareza',
        author: 'Dr. Lucas Ferreira',
        genre: 'Desenvolvimento pessoal',
        idea: 'Quero algo minimalista, sofisticado e com bastante espaço vazio. Uma composição zen que transmita calma imediata e autoridade intelectual para profissionais.',
        styles: ['Minimalista', 'Moderno', 'Elegante'],
        colorsMode: 'decide_for_me',
        colors: [],
        indispensable: 'Não tenho preferência.',
        indispensableNone: true,
        contactWhatsApp: '(21) 99123-8877',
        contactEmail: 'contato@drlucasferreira.com.br',
        status: 'Em produção',
        designerNotes: 'Aprovado rascunho de layout tipográfico com fundo off-white e detalhe geométrico em relevo.',
        images: [
          {
            id: 'sample_img_3',
            name: 'referencia_editorial_zen.jpg',
            dataUrl: 'https://images.unsplash.com/photo-1507842229447-ff4763b6525a?q=80&w=600&auto=format&fit=crop',
            size: '280 KB'
          }
        ]
      }
    ];
  }

  async checkAndSeedData() {
    if (!this.db) return;
    try {
      const count = await new Promise((resolve) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      });

      if (count === 0) {
        const seeds = this.getSeedItems();
        for (const seed of seeds) {
          const tx = this.db.transaction([STORE_NAME], 'readwrite');
          tx.objectStore(STORE_NAME).put(seed);
        }
      }
    } catch (err) {
      console.warn('Could not seed data into IndexedDB:', err);
    }
  }
}

window.db = new DatabaseManager();
