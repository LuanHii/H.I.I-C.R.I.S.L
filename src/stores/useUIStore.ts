import { create } from 'zustand';

type ModalId =
    | 'item-selector'
    | 'ability-selector'
    | 'skill-selector'
    | 'track-selector'
    | 'import-export'
    | 'weapon-mods'
    | 'agent-selector'
    | 'threat-manager'
    | 'pending-choice'
    | null;

interface UIState {
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    activeModal: ModalId;
    modalData: unknown;
    theme: 'dark' | 'terminal';
    scanlineEnabled: boolean;
    mobileMenuOpen: boolean;
    mobileDetailOpen: boolean;
    globalLoading: boolean;
    loadingMessage: string | null;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebarCollapsed: () => void;

    openModal: (id: ModalId, data?: unknown) => void;
    closeModal: () => void;

    setTheme: (theme: 'dark' | 'terminal') => void;
    toggleScanline: () => void;

    setMobileMenuOpen: (open: boolean) => void;
    setMobileDetailOpen: (open: boolean) => void;

    setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    sidebarCollapsed: false,
    activeModal: null,
    modalData: null,
    theme: 'dark',
    scanlineEnabled: true,
    mobileMenuOpen: false,
    mobileDetailOpen: false,
    globalLoading: false,
    loadingMessage: null,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    openModal: (id, data) => set({ activeModal: id, modalData: data }),
    closeModal: () => set({ activeModal: null, modalData: null }),
    setTheme: (theme) => set({ theme }),
    toggleScanline: () => set((state) => ({ scanlineEnabled: !state.scanlineEnabled })),
    setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    setMobileDetailOpen: (open) => set({ mobileDetailOpen: open }),
    setGlobalLoading: (loading, message) => set({
        globalLoading: loading,
        loadingMessage: message || null
    }),
}));
export const useModal = () => ({
    activeModal: useUIStore((state) => state.activeModal),
    modalData: useUIStore((state) => state.modalData),
    openModal: useUIStore((state) => state.openModal),
    closeModal: useUIStore((state) => state.closeModal),
});

export const useSidebar = () => ({
    sidebarOpen: useUIStore((state) => state.sidebarOpen),
    sidebarCollapsed: useUIStore((state) => state.sidebarCollapsed),
    toggleSidebar: useUIStore((state) => state.toggleSidebar),
    toggleSidebarCollapsed: useUIStore((state) => state.toggleSidebarCollapsed),
});
