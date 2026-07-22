import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Download, Loader2, Share, Smartphone, Apple, Monitor, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPromptVariant = 'banner' | 'icon';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !(window as any).MSStream;
}

const DISMISS_KEY = 'pv_install_dismissed_at';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function wasDismissedRecently(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  return raw ? Date.now() - Number(raw) < DISMISS_TTL_MS : false;
}
function saveDismissal() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

// ─── SVGs for Steps ───────────────────────────────────────────────────────────

const SvgDots = () => (
  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
);
const SvgPlus = () => (
  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const SvgCheck = () => (
  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const SvgBar = () => (
  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
    <rect x="3" y="4" width="18" height="3" rx="1.5" />
  </svg>
);

const DEVICE_CONTENT = {
  android: {
    title: 'Installer sur Android',
    subtitle: 'Via Chrome ou navigateur',
    steps: [
      { icon: <SvgDots />, text: 'Appuyez sur ⋮ (menu)', sub: 'En haut à droite' },
      { icon: <SvgPlus />, text: 'Sélectionnez « Ajouter à l\'écran d\'accueil »', sub: 'Ou « Installer l\'application »' },
      { icon: <SvgCheck />, text: 'Confirmez l\'installation', sub: 'Appuyez sur Ajouter / Installer' },
    ],
  },
  pc: {
    title: 'Installer sur PC / Mac',
    subtitle: 'Via Chrome ou Edge',
    steps: [
      { icon: <SvgBar />, text: 'Regardez la barre d\'adresse', sub: 'Icône d\'installation à droite' },
      { icon: <SvgPlus />, text: 'Cliquez « Installer PasseVite »', sub: 'Ou Menu > Installer…' },
      { icon: <SvgCheck />, text: 'Confirmez l\'installation', sub: 'Une fenêtre app s\'ouvrira' },
    ],
  },
};

// ─── iOS instructions modal ───────────────────────────────────────────────────

function IOSModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Instructions d'installation iOS"
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 pb-6 animate-fade-in"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-[2.5rem] border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-primary/20 overflow-hidden animate-slide-up gpu">
        <div className="h-1.5 w-full bg-primary/20" />
        <div
          className="h-1.5 w-full -mt-1.5"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }}
        />

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-block mb-3 p-2 rounded-xl bg-white shadow-md shadow-primary/10 border border-primary/5">
                <img src="/VitalWeb.png" alt="PasseVite" className="h-8 w-8 object-contain" />
              </div>
              <h2 className="text-lg font-black text-foreground tracking-tight italic">
                Ajouter à l'écran d'accueil
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                Safari iOS — 3 étapes rapides
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="shrink-0 mt-1 h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/30 transition-all active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Steps */}
          <ol className="space-y-4">
            {[
              {
                icon: (
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-3 3m3-3l3 3" />
                  </svg>
                ),
                text: "Appuyez sur l'icône Partager",
                sub: 'Barre inférieure de Safari',
              },
              {
                icon: (
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                ),
                text: "Sélectionnez « Sur l'écran d'accueil »",
                sub: 'Faites défiler vers le bas dans la liste',
              },
              {
                icon: (
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ),
                text: 'Appuyez sur « Ajouter »',
                sub: 'En haut à droite de la fenêtre',
              },
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="shrink-0 h-10 w-10 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-sm">
                  {step.icon}
                </div>
                <div className="pt-1">
                  <p className="text-sm font-bold text-foreground leading-tight">{step.text}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{step.sub}</p>
                </div>
              </li>
            ))}
          </ol>

          <Button
            id="install-ios-modal-close"
            onClick={onClose}
            variant="outline"
            className="w-full h-11 rounded-2xl border-2 border-primary/10 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:border-primary/20 active:scale-95 transition-all"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Device picker modal ──────────────────────────────────────────────────────

interface DevicePickerProps {
  deferredRef: React.MutableRefObject<BeforeInstallPromptEvent | null>;
  pendingRef: React.MutableRefObject<boolean>;
  onInstalled: () => void;
  onClose: () => void;
}

function DevicePickerModal({ deferredRef, pendingRef, onInstalled, onClose }: DevicePickerProps) {
  const [installing, setInstalling] = useState<string | false>(false);
  const [iosOpen, setIosOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState<'android' | 'pc' | null>(null);

  const triggerInstall = useCallback(async (key: 'android' | 'pc') => {
    if (deferredRef.current) {
      // Prompt is ready → fire immediately
      setInstalling(key);
      try {
        await deferredRef.current.prompt();
        const { outcome } = await deferredRef.current.userChoice;
        if (outcome === 'accepted') { onInstalled(); return; }
        deferredRef.current = null;
      } catch { /* ignored */ }
      setInstalling(false);
    } else {
      // Prompt not fired yet → Show manual instructions immediately
      setManualOpen(key);
      
      // Also flag pending so if it fires late, it auto-installs behind the scenes
      pendingRef.current = true;
    }
  }, [deferredRef, pendingRef, onInstalled]);

  const devices: {
    key: 'android' | 'ios' | 'pc';
    label: string;
    sub: string;
    Icon: React.ElementType;
  }[] = [
    { key: 'android', label: 'Android',       sub: 'Smartphone / Tablette', Icon: Smartphone },
    { key: 'ios',     label: 'iPhone / iPad', sub: 'iOS & iPadOS',           Icon: Apple },
    { key: 'pc',      label: 'PC / Mac',      sub: 'Chrome ou Edge',         Icon: Monitor },
  ];

  const handlePick = (key: 'android' | 'ios' | 'pc') => {
    if (key === 'ios') {
      setIosOpen(true);
    } else {
      // Android or PC → native install or manual instructions
      triggerInstall(key);
    }
  };

  return (
    <>
      {/* Device picker */}
      {!iosOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Installer PasseVite"
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 pb-6 animate-fade-in"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

          <div className="relative w-full max-w-sm rounded-[2.5rem] border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl shadow-primary/20 overflow-hidden animate-slide-up gpu">
            <div className="h-1.5 w-full bg-primary/20" />
            <div
              className="h-1.5 w-full -mt-1.5"
              style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }}
            />

            <div className="p-7 space-y-6">
              {manualOpen ? (
                <>
                  {/* Manual Steps Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <button
                        onClick={() => setManualOpen(null)}
                        className="flex items-center gap-1 text-[10px] text-primary uppercase tracking-widest font-black mb-2 hover:opacity-70 transition-opacity"
                      >
                        ← Retour
                      </button>
                      <h2 className="text-lg font-black text-foreground tracking-tight italic">
                        {DEVICE_CONTENT[manualOpen].title}
                      </h2>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        {DEVICE_CONTENT[manualOpen].subtitle}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      aria-label="Fermer"
                      className="shrink-0 mt-1 h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/30 transition-all active:scale-90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Steps */}
                  <ol className="space-y-4">
                    {DEVICE_CONTENT[manualOpen].steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="shrink-0 h-10 w-10 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shadow-sm">
                          {step.icon}
                        </div>
                        <div className="pt-1">
                          <p className="text-sm font-bold text-foreground leading-tight">{step.text}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{step.sub}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <Button
                    id="install-modal-close"
                    onClick={onClose}
                    variant="outline"
                    className="w-full h-11 rounded-2xl border-2 border-primary/10 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:border-primary/20 active:scale-95 transition-all"
                  >
                    Fermer
                  </Button>
                </>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="inline-block mb-3 p-2 rounded-xl bg-white shadow-md shadow-primary/10 border border-primary/5">
                        <img src="/VitalWeb.png" alt="PasseVite" className="h-8 w-8 object-contain" />
                      </div>
                      <h2 className="text-lg font-black text-foreground tracking-tight italic">
                        Installer PasseVite
                      </h2>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        Choisissez votre appareil
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      aria-label="Fermer"
                      className="shrink-0 mt-1 h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/30 transition-all active:scale-90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {devices.map(({ key, label, sub, Icon }) => (
                      <button
                        key={key}
                        id={`install-pick-${key}`}
                        onClick={() => handlePick(key)}
                        disabled={installing !== false}
                        className="
                          w-full flex items-center gap-4 px-5 py-4
                          rounded-2xl border border-primary/10 bg-primary/[0.03]
                          hover:bg-primary/5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5
                          disabled:opacity-50 disabled:cursor-wait
                          active:scale-[0.98] transition-all duration-200 text-left group
                        "
                      >
                        <div className="shrink-0 h-11 w-11 rounded-xl bg-white border border-primary/10 shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                          {installing === key
                            ? <Loader2 className="h-5 w-5 text-primary group-hover:text-white animate-spin" />
                            : <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                          }
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-foreground tracking-tight">{label}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            {installing === key ? 'Installation en cours…' : sub}
                          </p>
                        </div>
                        {key === 'ios' && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                        )}
                        {key !== 'ios' && (
                          <Download className="h-4 w-4 text-muted-foreground/30 group-hover:text-white transition-colors shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <Button
                    id="install-modal-close"
                    onClick={onClose}
                    variant="outline"
                    className="w-full h-11 rounded-2xl border-2 border-primary/10 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:border-primary/20 active:scale-95 transition-all"
                  >
                    Fermer
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* iOS instructions — opens on top */}
      {iosOpen && <IOSModal onClose={() => setIosOpen(false)} />}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InstallPromptProps {
  variant?: InstallPromptVariant;
}

export default function InstallPrompt({ variant = 'banner' }: InstallPromptProps) {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const pendingRef  = useRef(false);

  const [ready,    setReady]    = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── Capture beforeinstallprompt ───────────────────────────────────────────
  useEffect(() => {
    if (isStandalone()) return;
    if (variant === 'banner' && wasDismissedRecently()) return;

    setReady(true); // show button immediately for all non-standalone users

    if (isIOS()) return; // iOS never fires this event

    const handler = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;

      // Auto-trigger if user already clicked and is waiting (e.g. while reading manual steps)
      if (pendingRef.current) {
        pendingRef.current = false;
        deferredRef.current.prompt().then(async () => {
          const { outcome } = await deferredRef.current!.userChoice;
          if (outcome === 'accepted') setReady(false);
          deferredRef.current = null;
        }).catch(() => { /* ignored */ });
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [variant]);

  // ── Hide once installed ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => { setReady(false); setPickerOpen(false); };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const handleInstalled = useCallback(() => {
    setReady(false);
    setPickerOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    if (variant === 'banner') saveDismissal();
    setPickerOpen(false);
    setReady(false);
  }, [variant]);

  if (!ready) return null;

  // ── ICON variant ──────────────────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <>
        <button
          id="install-prompt-icon-btn"
          onClick={() => setPickerOpen(true)}
          aria-label="Installer PasseVite"
          title="Installer l'application"
          className="
            fixed top-4 right-4 z-[100]
            flex items-center gap-2 px-4 py-2.5
            rounded-2xl bg-white/80 backdrop-blur-xl
            border border-primary/10 shadow-lg shadow-primary/10 text-primary
            hover:bg-primary hover:text-white hover:border-primary hover:shadow-primary/30
            active:scale-95 transition-all duration-200 animate-fade-in gpu group
          "
        >
          <Download className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Installer</span>
        </button>

        {pickerOpen && (
          <DevicePickerModal
            deferredRef={deferredRef}
            pendingRef={pendingRef}
            onInstalled={handleInstalled}
            onClose={handleClose}
          />
        )}
      </>
    );
  }

  // ── BANNER variant ────────────────────────────────────────────────────────
  return (
    <>
      <div
        role="banner"
        aria-label="Install PasseVite"
        className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up gpu"
      >
        <div className="mx-auto max-w-md flex items-center gap-4 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-2xl shadow-primary/15 px-5 py-4">
          <div className="shrink-0 h-12 w-12 rounded-2xl bg-white shadow-md shadow-primary/10 border border-primary/5 flex items-center justify-center">
            <img src="/VitalWeb.png" alt="PasseVite" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-foreground tracking-tight truncate">Installer PasseVite</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">Accès rapide depuis l'écran d'accueil</p>
          </div>
          <Button
            id="install-prompt-banner-btn"
            onClick={() => setPickerOpen(true)}
            size="sm"
            className="shrink-0 rounded-2xl h-10 px-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Installer
          </Button>
          <button
            id="install-prompt-banner-dismiss"
            onClick={handleClose}
            aria-label="Fermer"
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/30 transition-all active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {pickerOpen && (
        <DevicePickerModal
          deferredRef={deferredRef}
          pendingRef={pendingRef}
          onInstalled={handleInstalled}
          onClose={handleClose}
        />
      )}
    </>
  );
}
