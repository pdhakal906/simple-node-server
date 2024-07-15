// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the original file extension
  },
});

const upload = multer({ storage });

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully.');
});

// Serve a simple HTML form for file upload
app.get('/', (req, res) => {
  res.send(`
    <h2>File Upload</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
    <h2>Uploaded Files</h2>
    <div id="file-list"></div>
    <script>
      fetch('/files')
        .then(response => response.json())
        .then(files => {
          const fileList = document.getElementById('file-list');
          files.forEach(file => {
            const img = document.createElement('img');
            img.src = '/uploads/' + file;
            img.alt = file;
            img.style.width = '200px'; // Adjust the width as needed
            fileList.appendChild(img);
          });
        });
    </script>
  `);
});

// Serve the uploads directory
app.use('/uploads', express.static('uploads'));

// Endpoint to get the list of uploaded files
app.get('/files', (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files.');
    }
    res.json(files);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
