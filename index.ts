import { processLicensePlate } from './recognizer.ts';
import * as cv from '@u4/opencv4nodejs';

export function recognizeLicensePlate(imagePath: string): Promise<[cv.Mat | null, string | null]> {
  const image = cv.imread(imagePath);
  return processLicensePlate(image);
}