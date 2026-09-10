// utils/audio.ts

let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let isLoading = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }

  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

async function loadAudioBuffer(): Promise<AudioBuffer | null> {
  if (audioBuffer) return audioBuffer;
  if (isLoading) return null;

  const ctx = getAudioContext();
  if (!ctx) return null;

  try {
    isLoading = true;
    const response = await fetch('/sound/explosao-sinistra.mp3');
    
    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error('Erro ao carregar o arquivo de áudio:', error);
    return null;
  } finally {
    isLoading = false;
  }
}

// Pré-carrega no primeiro toque/clique qualquer na página
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    loadAudioBuffer();
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };

  window.addEventListener('click', handleFirstInteraction);
  window.addEventListener('keydown', handleFirstInteraction);
}

/**
 * Toca o áudio no tempo determinado pelo delay
 */
export async function playBombSound(delayInSeconds = 0) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const buffer = await loadAudioBuffer();
  if (!buffer) return;

  const startTime = ctx.currentTime + delayInSeconds;

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();

  source.buffer = buffer;
  gainNode.gain.value = 0.5;

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start(startTime);
}