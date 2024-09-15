const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
// Load environment variables from the .env file
require('dotenv').config();

// Access environment variables
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;


const app = express();
const port = 3000;

//allows lilent querying
mongoose.set('strictQuery', false)

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.mp5chzg.mongodb.net/${dbName}`).then((result) => {
  app.listen(port);
}).catch((err) => {
  console.log(err)
})

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(userRoutes);
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

// Serve a simple HTML form for file upload
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>File Upload</title>
    </head>
    <body>
      <h1>Upload a File</h1>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" required />
        <button type="submit">Upload</button>
      </form>

      <h2>Uploaded Files</h2>
      <div id="file-list"></div>

      <script>
        // Fetch and display uploaded files
        fetch('/files')
          .then(response => response.json())
          .then(files => {
            const fileList = document.getElementById('file-list');
            fileList.innerHTML = '';
            files.forEach(file => {
              console.log("fhhd");
              if (file.endsWith('.mp4') || file.endsWith('.avi') || file.endsWith('.mkv') || file.endsWith('.mov')) {
                const fileDiv = document.createElement('div');
                const video = document.createElement('video');
                video.src = '/uploads/' + file;
                video.width= 320
                video.width = 240
                fileDiv.appendChild(video);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => {
                  fetch('/delete/' + file, { method: 'DELETE' })
                    .then(() => {
                      window.location.reload(); // Refresh the page after deletion
                    })
                    .catch(err => console.error('Error deleting file:', err));
                };
                fileDiv.appendChild(deleteButton);

                fileList.appendChild(fileDiv);
              } 
              else {
                    const fileDiv = document.createElement('div');
                    const img = document.createElement('img');
                    img.src = '/uploads/' + file;
                    img.alt = file;
                    img.style.maxWidth = '320px';
                    img.style.display = 'block';
                    fileDiv.appendChild(img);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = () => {
                      fetch('/delete/' + file, { method: 'DELETE' })
                        .then(() => {
                          window.location.reload(); // Refresh the page after deletion
                        })
                        .catch(err => console.error('Error deleting file:', err));
                    };
                    fileDiv.appendChild(deleteButton);

                    fileList.appendChild(fileDiv);
              };
              
            });
          });
      </script>
    </body>
    </html>
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

app.use(express.static(path.join(__dirname, 'public')));


app.get("/game/create", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'CreatePage.html'));
})
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'LoginPage.html'));
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
