import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown, BadgeCheck, Heart, ShieldCheck, Volume2, VolumeX, Play, Pause } from 'lucide-react';

const MOBILE_VIDEO = '/videos/bem-garota-mobile.mp4';
const DESKTOP_VIDEO = '/videos/bem-garota-desktop.mp4';

export const StoreOpeningVideo: React.FC = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSource = isMobile ? MOBILE_VIDEO : DESKTOP_VIDEO;

  // Responsive device switch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateDevice = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateDevice);
    return () => mediaQuery.removeEventListener('change', updateDevice);
  }, []);

  // Safe playback and browser autoplay policy compliance
  const attemptPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.defaultMuted = isMuted;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Autoplay prevented by browser, waiting for user gesture:', err);
          setIsPlaying(false);
        });
    }
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure audio policy compliance
    video.muted = isMuted;
    video.defaultMuted = isMuted;
    video.playsInline = true;

    attemptPlay();

    // If autoplay was blocked, resume on first user interaction anywhere
    const onUserGesture = () => {
      if (video && video.paused) {
        attemptPlay();
      }
    };

    window.addEventListener('pointerdown', onUserGesture, { once: true });
    window.addEventListener('touchstart', onUserGesture, { once: true });
    window.addEventListener('scroll', onUserGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', onUserGesture);
      window.removeEventListener('touchstart', onUserGesture);
      window.removeEventListener('scroll', onUserGesture);
    };
  }, [videoSource, attemptPlay, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    // If unmuting while paused, try to play
    if (!nextMuted && video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const scrollToCatalog = () => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative isolate flex min-h-[calc(100svh_-_4rem)] items-center overflow-hidden bg-[#26051c] text-white sm:min-h-[calc(100svh_-_5rem)] select-none">
      {/* Background Video */}
      {!hasError && (
        <video
          ref={videoRef}
          key={videoSource}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={() => setVideoLoaded(true)}
          onCanPlay={() => attemptPlay()}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error('Erro ao carregar o vídeo:', videoSource, e);
            setHasError(true);
          }}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-80'
          }`}
        >
          <source src={videoSource} type="video/mp4" />
        </video>
      )}

      {/* Cinematic boutique gradients for high legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#170a13]/70 via-[#2a1220]/40 to-[#170a13]/25 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#170a13]/60 via-transparent to-[#170a13]/20 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f0d5c5] sm:text-xs">
            Moda feminina feita para você
          </p>
          <h1 className="font-boutique text-4xl font-semibold leading-[1.05] tracking-tight text-white drop-shadow-md sm:text-6xl lg:text-7xl">
            Vista sua <span className="font-normal italic text-[#f3d8cd]">melhor versão!</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/90 sm:text-lg drop-shadow-sm">
            Moda, estilo e beleza em cada detalhe.
          </p>

          <div className="mt-7 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
            <div className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-2 text-center text-[10px] font-medium text-white backdrop-blur-sm sm:gap-2 sm:px-3 sm:text-xs shadow-sm">
              <BadgeCheck className="h-4 w-4 shrink-0 text-[#e8c8b7]" aria-hidden="true" />
              <span>Qualidade garantida</span>
            </div>
            <div className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-2 text-center text-[10px] font-medium text-white backdrop-blur-sm sm:gap-2 sm:px-3 sm:text-xs shadow-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#e8c8b7]" aria-hidden="true" />
              <span>Compra segura</span>
            </div>
            <div className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-2 text-center text-[10px] font-medium text-white backdrop-blur-sm sm:gap-2 sm:px-3 sm:text-xs shadow-sm">
              <Heart className="h-4 w-4 shrink-0 text-[#e8c8b7]" aria-hidden="true" />
              <span>Sempre com você</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={scrollToCatalog}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#a51b63] via-[#80194f] to-[#54113f] px-8 py-3 text-sm font-bold tracking-wide text-white shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0d5c5] sm:text-base cursor-pointer"
            >
              Ver Loja
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Boutique Video Controls (Play/Pause & Sound) */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 sm:bottom-7 sm:right-8">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          title={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
          aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white translate-x-0.5" />}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          title={isMuted ? 'Ativar som' : 'Desativar som'}
          aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-white/80" /> : <Volume2 className="h-4 w-4 text-[#f3d8cd]" />}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-white/65 sm:bottom-7">
        Descubra seu estilo
      </div>
    </section>
  );
};
