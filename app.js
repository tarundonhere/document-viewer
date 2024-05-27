let pdfData = null;

document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.type === 'application/pdf') {
      console.log('PDF file selected: ' + file.name);
      const fileReader = new FileReader();
      fileReader.onload = function() {
        console.log('File reading completed');
        pdfData = new Uint8Array(this.result);
        const url = window.URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
        window.open(url, '_blank');
        document.getElementById('loadingMessage').textContent = '';
      };
      fileReader.onerror = function(error) {
        console.error('Error reading PDF: ', error);
        document.getElementById('loadingMessage').textContent = 'Failed to open PDF.';
      };
      fileReader.readAsArrayBuffer(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      console.log('Word file selected: ' + file.name);
      
      const reader = new FileReader();
      reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then(result => {
            const text = result.value;
            console.log('Extracted text:', text);

            // Option 1: Download text as a new file
            const blob = new Blob([text], { type: 'text/plain' });
            const fileName = file.name + '.txt';
            saveAs(blob, fileName); // Using FileSaver.js

            // Option 2: Display text in a text area
            document.getElementById('wordContent').textContent = text;
          })
          .catch(err => {
            console.error('Error extracting text from Word document:', err);
            document.getElementById('loadingMessage').textContent = 'Failed to open Word document.';
          });
      };

      reader.onerror = function(error) {
        console.error('Error reading Word document:', error);
        document.getElementById('loadingMessage').textContent = 'Failed to open Word document.';
      };

      reader.readAsArrayBuffer(file);
    } else {
      console.error('Unsupported file format. Please select a PDF or Word document.');
    }
  }
});

function renderPdf(pdfData) {
    pdfjsLib.getDocument(pdfData).promise.then(function(pdf) {
        console.log('PDF loaded');
        pdf.getPage(1).then(function(page) {
            console.log('Page 1 loaded');
            const scale = 1.5;
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext).promise.then(function() {
                console.log('Page rendered');
                document.getElementById('pdfViewer').appendChild(canvas);
            });
        });
    }).catch(function(error) {
        console.error('Error loading PDF: ', error);
    });
}