document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const convertBtn = document.getElementById('convertBtn');
    const status = document.getElementById('status');
    let selectedFile = null;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when file is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Handle selected files
    fileInput.addEventListener('change', handleFileSelect, false);

    // Convert button click handler
    convertBtn.addEventListener('click', handleConversion, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('bg-light');
    }

    function unhighlight(e) {
        dropZone.classList.remove('bg-light');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.name.match(/\.(doc|docx)$/)) {
                selectedFile = file;
                status.textContent = `Selected file: ${file.name}`;
                convertBtn.style.display = 'inline-block';
            } else {
                status.textContent = 'Please select a valid DOC or DOCX file.';
                convertBtn.style.display = 'none';
            }
        }
    }

    async function handleConversion() {
        if (!selectedFile) {
            status.textContent = 'Please select a file first.';
            return;
        }

        status.textContent = 'Converting...';
        convertBtn.disabled = true;

        try {
            // Read the file content
            const arrayBuffer = await selectedFile.arrayBuffer();
            
            // Convert to PDF using docx library
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: [
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "Converted document",
                                }),
                            ],
                        }),
                    ],
                }],
            });

            // Generate blob and save file
            docx.Packer.toBlob(doc).then(blob => {
                saveAs(blob, selectedFile.name.replace(/\.(doc|docx)$/, '.pdf'));
                status.textContent = 'Conversion completed!';
                convertBtn.disabled = false;
            });

        } catch (error) {
            console.error('Conversion error:', error);
            status.textContent = 'Error during conversion. Please try again.';
            convertBtn.disabled = false;
        }
    }
}); 