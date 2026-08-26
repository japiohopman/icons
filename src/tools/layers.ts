import { EditorEngine } from '@/types/engine';

export async function executeDuplicateLayerTool(engine: EditorEngine): Promise<void> {
  return engine.duplicateLayer();
}

export async function executeDeleteLayerTool(engine: EditorEngine): Promise<void> {
  return engine.deleteActiveLayer();
}

export async function executeSetLayerOpacityTool(
  engine: EditorEngine,
  opacity: number
): Promise<void> {
  return engine.setLayerOpacity(opacity);
}
