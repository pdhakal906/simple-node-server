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
  res.redirect('/'); // Refresh the page after upload
});

// Route to handle folder upload
app.post('/upload-folder', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  // Send response with uploaded files
  const filePaths = req.files.map(file => file.path);
  res.redirect('/');
});

// Serve a simple HTML form for file upload
app.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'UploadPage.html'))
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

app.use(express.static(path.join(__dirname, 'public')));


app.get("/game/create", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'CreatePage.html'));
})

app.get("/game/join", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'JoinPage.html'));
})
// Endpoint to delete an uploaded file
app.delete('/delete/:filename', (req, res) => {
  const filepath = path.join('uploads', req.params.filename);
  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).send('Unable to delete file.');
    }
    res.sendStatus(200);
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
