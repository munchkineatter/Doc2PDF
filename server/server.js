const express = require('express');
const multer = require('multer');
const cors = require('cors');
const libre = require('libreoffice-convert');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const convertAsync = promisify(libre.convert);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/convert', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, 'uploads', `${Date.now()}.pdf`);

    try {
        const ext = '.pdf'
        const file = await fs.promises.readFile(inputPath);
        const pdfBuffer = await convertAsync(file, ext, undefined);
        
        await fs.promises.writeFile(outputPath, pdfBuffer);
        
        res.download(outputPath, 'converted.pdf', (err) => {
            // Cleanup files after sending
            fs.unlink(inputPath, () => {});
            fs.unlink(outputPath, () => {});
        });
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).send('Error converting file');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 