import { useState, useRef, useCallback, useEffect } from 'react';
import { Asset } from '@/types/asset';
import { EditorEngine, EngineStatus } from '@/types/engine';
import { PhotopeaEngine } from '@/engine/PhotopeaEngine';

export function useEditor(initialAsset: Asset | null) {
  const [status, setStatus] = useState<EngineStatus>('uninitialized');
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<EditorEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initEngine = useCallback(async (container: HTMLDivElement) => {
    if (engineRef.current) return;

    try {
      setError(null);
      const engine = new PhotopeaEngine();
      engineRef.current = engine;

      engine.onStatusChange((s) => setStatus(s));
      await engine.init(container);

      if (initialAsset) {
        await engine.loadAsset(initialAsset);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize EditorEngine');
    }
  }, [initialAsset]);

  const resize = useCallback(async (width: number, height: number): Promise<Asset | null> => {
    if (!engineRef.current) return null;
    try {
      setError(null);
      return await engineRef.current.resize(width, height);
    } catch (err: any) {
      setError(err?.message || 'Resize operation failed');
      return null;
    }
  }, []);

  const exportResult = useCallback(async (format: 'png' | 'jpg' | 'webp' | 'svg' = 'png'): Promise<Asset | null> => {
    if (!engineRef.current) return null;
    try {
      setError(null);
      return await engineRef.current.exportResult({ format });
    } catch (err: any) {
      setError(err?.message || 'Export operation failed');
      return null;
    }
  }, []);

  const destroyEngine = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      destroyEngine();
    };
  }, [destroyEngine]);

  return {
    containerRef,
    status,
    error,
    initEngine,
    resize,
    exportResult,
    destroyEngine,
  };
}
