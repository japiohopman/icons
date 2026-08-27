import { EditorEngine } from '@/types/engine';
import { Asset, ExportOptions } from '@/types/asset';

export interface EditingPreset {
  id: string;
  name: string;
  description: string;
  format: 'png' | 'svg' | 'webp' | 'jpg';
  width?: number;
  height?: number;
}

export const REUSABLE_PRESETS: EditingPreset[] = [
  { id: 'standard_svg', name: 'Canonical Vector SVG', description: 'Clean scalable vector for Asset Vault persistence', format: 'svg' },
  { id: 'hd_png', name: 'HD Icon PNG (512x512)', description: 'High-resolution raster output with transparent background', format: 'png', width: 512, height: 512 },
  { id: 'ui_thumbnail', name: 'UI Thumbnail (128x128)', description: 'Lightweight web preview icon', format: 'png', width: 128, height: 128 },
  { id: 'compressed_webp', name: 'Optimized WebP', description: 'Fast loading web asset format', format: 'webp', width: 256, height: 256 },
];

export async function executeExportTool(
  engine: EditorEngine,
  options?: ExportOptions
): Promise<Asset> {
  return engine.exportResult(options);
}

export async function applyEditingPreset(
  engine: EditorEngine,
  preset: EditingPreset
): Promise<Asset> {
  if (preset.width && preset.height) {
    await engine.resize(preset.width, preset.height);
  }
  return engine.exportResult({ format: preset.format });
}
