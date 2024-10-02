import * as fs from 'fs';
import * as path from 'path';
import { createLogger, format, transports, Logger } from 'winston';
import * as cv from '@u4/opencv4nodejs';
import * as tesseract from 'node-tesseract-ocr';

// Set up logging
const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} - ${level}: ${message}`;
    })
  ),
  transports: [new transports.Console()]
});

export async function processLicensePlate(image: cv.Mat): Promise<[cv.Mat | null, string | null]> {
  const licensePlate: cv.Mat | null = detectLicensePlate(image);
  if (!licensePlate) {
    logger.warn("No license plate detected");
    return [null, null];
  }

  const text: string = await recognizeText(licensePlate);

  // Create output folder and save images
  const currentDate = new Date().toISOString().split('T')[0];
  const outputFolder = path.join("output", currentDate);
  fs.mkdirSync(outputFolder, { recursive: true });

  // Save original image
  const originalFilename = `original_${Date.now()}.jpg`;
  const originalPath = path.join(outputFolder, originalFilename);
  cv.imwrite(originalPath, image);
  logger.info(`Original image saved as ${originalPath}`);

  // Save license plate image
  let plateFilename;
  if (text && text !== "unknown") {
    const sanitizedText = text.replace(/[^a-zA-Z0-9]/g, '');
    plateFilename = `plate_${sanitizedText}_${Date.now()}.jpg`;
  } else {
    plateFilename = `plate_unrecognized_${Date.now()}.jpg`;
  }
  const platePath = path.join(outputFolder, plateFilename);
  cv.imwrite(platePath, licensePlate);
  logger.info(`License plate image saved as ${platePath}`);

  if (text) {
    logger.info(`Detected license plate text: ${text}`);
  } else {
    logger.warn("No text detected on the license plate");
  }

  return [licensePlate, text || "unknown"];
}

function detectLicensePlate(image: cv.Mat): cv.Mat | null {
  const hsv: cv.Mat = image.cvtColor(cv.COLOR_BGR2HSV);

  // Create yellow and white masks
  const lowerYellow: cv.Vec3 = new cv.Vec3(10, 50, 50);
  const upperYellow: cv.Vec3 = new cv.Vec3(40, 255, 255);
  const yellowMask: cv.Mat = hsv.inRange(lowerYellow, upperYellow);

  const lowerWhite: cv.Vec3 = new cv.Vec3(0, 0, 200);
  const upperWhite: cv.Vec3 = new cv.Vec3(180, 30, 255);
  const whiteMask: cv.Mat = hsv.inRange(lowerWhite, upperWhite);

  // Combine masks and apply morphological operations
  const combinedMask: cv.Mat = yellowMask.bitwiseOr(whiteMask);
  const kernel: cv.Mat = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
  let processedMask: cv.Mat = combinedMask.morphologyEx(kernel, cv.MORPH_CLOSE);
  processedMask = processedMask.morphologyEx(kernel, cv.MORPH_OPEN);

  // Find and sort contours
  const contours: cv.Contour[] = processedMask.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  contours.sort((a: cv.Contour, b: cv.Contour) => b.area - a.area);

  // Find license plate contour
  for (const contour of contours.slice(0, 10)) {
    const perimeter: number = contour.arcLength(true);
    const approx: cv.Point2[] = contour.approxPolyDP(0.02 * perimeter, true);
    if (approx.length >= 4 && approx.length <= 8) {
      const rect: cv.Rect = contour.boundingRect();
      const aspectRatio: number = rect.width / rect.height;
      const area: number = contour.area;
      if (aspectRatio >= 1.0 && aspectRatio <= 6.0 && area > 500) {
        return image.getRegion(rect);
      }
    }
  }

  return null;
}

async function recognizeText(image: cv.Mat): Promise<string> {
  // Try Tesseract OCR first
  const config: tesseract.Config = {
    psm: 7,
    oem: 3,
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  };

  try {
    const buffer = cv.imencode('.png', image);
    const text: string = await tesseract.recognize(buffer, config);
    if (text.trim()) {
      logger.info(`Text recognized by Tesseract OCR: ${text.trim()}`);
      return text.trim();
    }
  } catch (error: any) {
    logger.error(`Tesseract OCR error: ${error.message}`);
  }

  // If Tesseract fails, try EasyOCR (Note: You may need to find a Node.js compatible OCR library)
//   logger.info("Tesseract OCR failed to recognize text, switching to EasyOCR");
//   try {
//     const reader = await easyocr.load(['en']);
//     const results = await reader.readtext(image);
//     const text = results.map(result => result[1]).join('');
//     if (text) {
//       logger.info(`Text recognized by EasyOCR: ${text}`);
//       return text.trim();
//     }
//   } catch (error) {
//     logger.error(`EasyOCR error: ${error.message}`);
//   }

//   logger.warn("Both Tesseract and EasyOCR failed to recognize text");
  return '';
}

