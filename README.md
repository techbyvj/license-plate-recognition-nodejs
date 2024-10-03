# License Plate Recognizer

A Node.js package for license plate recognition using OpenCV and OCR.

## Description

This package provides a robust solution for recognizing license plates in images. It uses computer vision techniques with OpenCV for plate detection and Optical Character Recognition (OCR) for text extraction.

## Features

- License plate detection in images
- Text recognition from detected license plates
- Logging of recognition process
- Saving of original and processed images

## Installation

To install the package, run:

```bash
npm install license-plate-recognizer
```

## Usage

Here's a basic example of how to use the package:

```typescript
import { recognizeLicensePlate } from 'license-plate-recognizer';

const imagePath = 'path/to/your/image.jpg';
recognizeLicensePlate(imagePath)
  .then(([licensePlate, text]) => {
    if (licensePlate && text) {
      console.log(`Detected license plate: ${text}`);
    } else {
      console.log('No license plate detected');
    }
  })
  .catch(error => console.error('Error:', error));
```

## API

### `recognizeLicensePlate(imagePath: string): Promise<[cv.Mat | null, string | null]>`

Processes an image and attempts to recognize a license plate.

- `imagePath`: The path to the image file.
- Returns: A Promise that resolves to a tuple containing:
  - The detected license plate image (`cv.Mat` object) or `null` if not found.
  - The recognized text from the license plate or `null` if not recognized.

## Dependencies

This package relies on the following main dependencies:

- [@u4/opencv4nodejs](https://www.npmjs.com/package/@u4/opencv4nodejs): For image processing and computer vision tasks.
- [node-tesseract-ocr](https://www.npmjs.com/package/node-tesseract-ocr): For Optical Character Recognition.
- [winston](https://www.npmjs.com/package/winston): For logging.

Make sure to install Tesseract OCR on your system for text recognition to work properly.

## Output

Processed images are saved in an `output` directory, organized by date. The original image and the cropped license plate image (if detected) are both saved.

## Development

To set up the development environment:

1. Clone the repository:
   ```bash
   git clone https://github.com/techbyvj/license-plate-recognition-nodejs.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Issues

If you encounter any problems or have suggestions, please file an issue on the [GitHub repository](https://github.com/techbyvj/license-plate-recognition-nodejs/issues).

## Connect

Follow the author on X (Twitter): [@saidbyvj](https://x.com/saidbyvj)