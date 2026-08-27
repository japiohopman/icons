import { EditorEngine } from '@/types/engine';
import { Asset, CanvasAnchor, CropBounds } from '@/types/asset';

export async function executeCanvasResizeTool(
  engine: EditorEngine,
  width: number,
  height: number,
  anchor?: CanvasAnchor
): Promise<Asset> {
  return engine.resizeCanvas(width, height, anchor);
}

export async function executeCropTool(
  engine: EditorEngine,
  bounds: CropBounds
): Promise<Asset> {
  return engine.crop(bounds);
}
