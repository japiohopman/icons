import { EditorEngine } from '@/types/engine';
import { Asset, ExportOptions } from '@/types/asset';

export async function executeExportTool(
  engine: EditorEngine,
  options?: ExportOptions
): Promise<Asset> {
  return engine.exportResult(options);
}
