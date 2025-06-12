import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  LinearProgress,
  Avatar,
  Link,
  Paper,
  Alert,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Folder,
  Home,
  AttachFile,
  Delete
} from '@mui/icons-material';

interface UploadProgress {
  show: boolean;
  progress: number;
  text: string;
}

const MainPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    show: false,
    progress: 0,
    text: ''
  });
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadMessage('');
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadMessage('');
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setUploadMessage('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploadProgress({ show: true, progress: 0, text: 'Uploading...' });

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress({
            show: true,
            progress: percentComplete,
            text: `Uploading... ${Math.round(percentComplete)}%`
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadMessage('File uploaded successfully!');
          setSelectedFile(null);
          // Reset file input
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        } else {
          setUploadMessage('Upload failed. Please try again.');
        }
        setUploadProgress({ show: false, progress: 0, text: '' });
      });

      xhr.addEventListener('error', () => {
        setUploadMessage('Upload failed. Please try again.');
        setUploadProgress({ show: false, progress: 0, text: '' });
      });

      xhr.open('POST', '/upload');
      xhr.send(formData);
    } catch (error) {
      setUploadMessage('Upload failed. Please try again.');
      setUploadProgress({ show: false, progress: 0, text: '' });
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7f3e9 0%, #e8dcc6 50%, #d4c5a9 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        <Box textAlign="center" mb={4}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 900, 
            background: 'linear-gradient(45deg, #8b4513 30%, #a0522d 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Simple Server
          </Typography>
          <Typography variant="h5" component="h2" sx={{ 
            fontWeight: 500, 
            color: '#8b4513',
            mb: 4,
            fontSize: { xs: '1.2rem', md: '1.5rem' }
          }}>
            A Light Weighted Server System
          </Typography>
        </Box>

        <Box maxWidth="sm" mx="auto">
          {/* Upload File Card */}
          <Card sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
          }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'white',
                fontWeight: 600
              }}>
                <CloudUpload />
                Upload File
              </Typography>
              
              <Box component="form" onSubmit={handleUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Custom File Upload Area */}
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    border: `2px dashed ${isDragOver ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'}`,
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    bgcolor: isDragOver ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.6)'
                    }
                  }}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  
                  {selectedFile ? (
                    <Box>
                      <AttachFile sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                      <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                        File Selected
                      </Typography>
                      <Chip
                        label={selectedFile.name}
                        onDelete={handleRemoveFile}
                        deleteIcon={<Delete />}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.8)' },
                          maxWidth: '100%'
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUpload sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                      <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                        {isDragOver ? 'Drop your file here' : 'Choose a file or drag it here'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Click to browse or drag and drop your file
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  startIcon={<CloudUpload />}
                  disabled={uploadProgress.show || !selectedFile}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Upload File
                </Button>
              </Box>

              {uploadProgress.show && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress.progress} 
                    sx={{ 
                      mb: 1,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {uploadProgress.text}
                  </Typography>
                </Box>
              )}

              {uploadMessage && (
                <Alert 
                  severity={uploadMessage.includes('success') ? 'success' : 'error'} 
                  sx={{ mt: 2 }}
                >
                  {uploadMessage}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Drive Card */}
          <Card sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
          }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'white',
                fontWeight: 600
              }}>
                <Folder />
                Drive
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Folder sx={{ color: 'white' }} />
                <Button 
                  variant="contained" 
                  href="/files"
                  startIcon={<Home />}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Browse Files Here
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
          }}>
          </Card>

          {/* Avatar */}
          <Box textAlign="center" mb={3}>
            <Avatar
              src="/avatar.jpeg"
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto',
                border: '3px solid rgb(40, 80, 250)'
              }}
            />
          </Box>

          {/* Footer */}
          <Box textAlign="center">
            <Typography variant="body2" sx={{ color: '#8b4513' }}>
              Developed by{' '}
              <Link 
                href="https://github.com/lihaozhe013/simple-NAS-nodejs" 
                target="_blank"
                sx={{ 
                  color: '#a0522d',
                  textDecoration: 'underline',
                  '&:hover': { color: '#8b4513' }
                }}
              >
                lihaozhe013
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MainPage; 