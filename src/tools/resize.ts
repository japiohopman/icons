import { EditorEngine } from '@/types/engine';
import { Asset } from '@/types/asset';

export async function executeResizeTool(
  engine: EditorEngine,
  width: number,
  height: number
): Promise<Asset> {
  return engine.resize(width, height);
}
