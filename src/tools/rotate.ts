import { EditorEngine } from '@/types/engine';

export async function executeRotateTool(engine: EditorEngine, angle: number): Promise<void> {
  return engine.rotate(angle);
}

export async function executeFlipTool(
  engine: EditorEngine,
  direction: 'horizontal' | 'vertical'
): Promise<void> {
  return engine.flip(direction);
}
