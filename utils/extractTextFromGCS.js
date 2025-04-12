const vision = require('@google-cloud/vision');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Auth clients
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '../talentlink-456012-085abb34dcc0.json'),
});

const storage = new Storage({
  keyFilename: path.join(__dirname, '../talentlink-456012-085abb34dcc0.json'),
});

// OCR function
const extractTextFromGCS = async (gcsUri) => {
  try {
    console.log("Starting OCR for URI:", gcsUri);

    const outputPrefix = `ocr-results/${uuidv4()}/`;
    const outputUri = `gs://talent_link/${outputPrefix}`;

    const request = {
      requests: [
        {
          inputConfig: {
            gcsSource: {
              uri: gcsUri,
            },
            mimeType: 'application/pdf',
          },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          outputConfig: {
            gcsDestination: {
              uri: outputUri,
            },
            batchSize: 2,
          },
        },
      ],
    };

    // Start OCR job
    const [operation] = await visionClient.asyncBatchAnnotateFiles(request);
    console.log("Processing OCR...");
    const [filesResponse] = await operation.promise();

    // Locate output JSON file in GCS
    const bucketName = 'talent_link';
    const [files] = await storage.bucket(bucketName).getFiles({
      prefix: outputPrefix,
    });

    const jsonFile = files.find(file => file.name.endsWith('.json'));
    if (!jsonFile) {
      throw new Error("OCR output file not found in GCS.");
    }

    // Download and parse OCR result
    const contents = await jsonFile.download();
    const ocrData = JSON.parse(contents[0]);

    const pages = ocrData.responses || [];
    const fullText = pages.map(p => p.fullTextAnnotation?.text || '').join('\n').trim();

    return fullText || "No text found in the document.";

  } catch (error) {
    console.error("OCR Error:", error);
    return `OCR error: ${error.message}`;
  }
};

module.exports = extractTextFromGCS;
