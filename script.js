document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFileSelect, false);
    convertBtn.addEventListener('click', convertToPdf);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('dragover');
    }

    function unhighlight(e) {
        dropZone.classList.remove('dragover');
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
            if (file.type === 'application/msword' || 
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                fileName.textContent = `Selected file: ${file.name}`;
                convertBtn.disabled = false;
            } else {
                alert('Please select a valid Word document (.doc or .docx)');
                fileName.textContent = '';
                convertBtn.disabled = true;
            }
        }
    }

    async function convertToPdf() {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            convertBtn.disabled = true;
            convertBtn.textContent = 'Converting...';

            const response = await fetch('YOUR_RENDER_URL/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Conversion failed');

            // Create a blob from the PDF file
            const blob = await response.blob();
            
            // Create a download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = file.name.replace(/\.(doc|docx)$/, '.pdf');
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            alert('Error converting file: ' + error.message);
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to PDF';
        }
    }
}); 