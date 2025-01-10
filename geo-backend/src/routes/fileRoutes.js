const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const geojson = require('geojson');  // Assuming GeoJSON processing library
const { parseString } = require('xml2js'); // For KML parsing (example)
const tiff = require('tiff');  // For TIFF parsing (optional, depends on your needs)
const geojsonValidation = require('geojson-validation');
const authenticate = require('../middleware/auth'); // Import authentication middleware

// Initialize Express Router
const router = express.Router();

// Set up storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads'; // Directory where files will be stored
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Create the directory if it doesn't exist
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Save files with original names
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter function to allow only GeoJSON, KML, and TIFF files
const fileFilter = (req, file, cb) => {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const allowedExtensions = ['geojson', 'kml', 'tiff'];

    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only GeoJSON, KML, and TIFF files are allowed.'), false); // Reject the file
    }
};

// Initialize Multer with the storage and file filter options
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Max file size: 10MB
});

// Helper function to process GeoJSON file
const processGeoJSON = (filePath) => {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const geojsonData = JSON.parse(fileData);
        
    // Simple validation (checks for required fields)
    if (geojsonData && geojsonData.type === 'FeatureCollection' && Array.isArray(geojsonData.features)) {
        console.log('Valid GeoJSON!');
        // Return the parsed GeoJSON data
    } else {
        console.error('Invalid GeoJSON structure!');
    }
    return JSON.parse(fileData); // Return the parsed GeoJSON data
};

// Helper function to process KML file (simplified)
const processKML = (filePath) => {
    const kmlData = fs.readFileSync(filePath, 'utf8');
    let geojsonData = null;

    parseString(kmlData, (err, result) => {
        if (err) {
            throw new Error('Error parsing KML file');
        }
        geojsonData = result; // You can convert this result to GeoJSON
    });

    return geojsonData;
};

// Helper function to process TIFF file (simplified, depends on what you need)
const processTIFF = (filePath) => {
    const tiffData = fs.readFileSync(filePath);
    const geojsonData = tiff.fromBuffer(tiffData); // You would need to use a TIFF-to-GeoJSON library
    return geojsonData;
};

// Route to handle file upload (with authentication middleware)
router.post('/upload', authenticate, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded.' });
        }

        let dataset = { id: Date.now().toString(), data: null };

        // Process the uploaded file based on type
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
        const filePath = path.join(__dirname, '../..', req.file.path); // Absolute file path

        if (fileExtension === 'geojson') {
            dataset.data = processGeoJSON(filePath); // Parse the GeoJSON
        } else if (fileExtension === 'kml') {
            dataset.data = processKML(filePath); // Parse the KML
        } else if (fileExtension === 'tiff') {
            dataset.data = processTIFF(filePath); // Convert TIFF to GeoJSON (if possible)
        }

        // Send response back with dataset (ID + GeoJSON data)
        res.status(200).send({
            message: 'File uploaded and processed successfully',
            dataset: dataset // Send the dataset containing id and GeoJSON data
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while uploading and processing the file.' });
    }
});

module.exports = router;
