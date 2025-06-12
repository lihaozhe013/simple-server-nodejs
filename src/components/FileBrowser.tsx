import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Search,
  Clear,
  Folder,
  InsertDriveFile,
  ArrowBack,
  Home,
  FolderOpen
} from '@mui/icons-material';

interface FileEntry {
  name: string;
  isDirectory: boolean;
}

interface SearchResult {
  file_name: string;
  file_path: string;
  relative_path: string;
}

interface SearchResponse {
  query?: {
    file_name: string;
    current_dir: string;
  };
  results?: SearchResult[];
  count?: number;
  error?: string;
  details?: string;
}

const FileBrowser: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchCount, setSearchCount] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('');

  const getCurrentDirectoryPath = (): string => {
    let pathname = window.location.pathname;
    if (pathname.startsWith('/files')) {
      let path = pathname.substring('/files'.length);
      if (path.startsWith('/')) path = path.substring(1);
      if (path.endsWith('/')) path = path.slice(0, -1);
      return decodeURIComponent(path);
    }
    return '';
  };

  const fetchFiles = async (path: string = '') => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/list-files?path=${encodeURIComponent(path)}`);
      const filesData: FileEntry[] = await res.json();
      setFiles(filesData);
      setCurrentPath(path);
    } catch (err) {
      setError('Failed to load files');
      console.error('Error fetching files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a filename to search');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const currentDir = getCurrentDirectoryPath();
      const encodedFileName = encodeURIComponent(searchQuery);
      const encodedCurrentDir = encodeURIComponent(currentDir);
      const url = `/api/search_feat/file_name=${encodedFileName}/current_dir=${encodedCurrentDir}`;
      
      const response = await fetch(url);
      const data: SearchResponse = await response.json();

      if (data.error) {
        setError(`Error: ${data.error}`);
        return;
      }

      if (!data.results || data.count === 0) {
        setSearchResults([]);
        setSearchCount(0);
        setError(`No files found matching "${searchQuery}"`);
      } else {
        setSearchResults(data.results);
        setSearchCount(data.count || 0);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setError('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const getFileIcon = (isDirectory: boolean) => {
    return isDirectory ? <Folder color="primary" /> : <InsertDriveFile />;
  };

  const getNavigationUrl = (path: string, fileName: string, isDirectory: boolean) => {
    const fullPath = path ? `${path}/${fileName}` : fileName;
    const encodedPath = fullPath.split('/').map(encodeURIComponent).join('/');
    
    if (isDirectory) {
      return `/files/${encodedPath}/`;
    } else {
      return `/files/${encodedPath}`;
    }
  };

  const getBackUrl = () => {
    if (currentPath) {
      const up = currentPath.split('/').slice(0, -1).join('/');
      let upUrl = '/files';
      if (up) upUrl += '/' + encodeURIComponent(up).replace(/%2F/g, '/');
      if (!upUrl.endsWith('/')) upUrl += '/';
      return upUrl;
    }
    return '/';
  };

  useEffect(() => {
    const path = getCurrentDirectoryPath();
    fetchFiles(path);
  }, []);

  return (
    <Box sx={{ 
      flexGrow: 1,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7f3e9 0%, #e8dcc6 50%, #d4c5a9 100%)'
    }}>
      {/* Top Header */}
      <AppBar position="static" sx={{ 
        background: '#1a202c'
      }}>
        <Toolbar sx={{ py: 1 }}>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1, 
            color: '#f0f6fc',
            fontWeight: 700
          }}>
            File Browser
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: 400, flex: 1 }}>
            <TextField
              size="small"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'white', borderRadius: 1 }
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            
                         <Button
               variant="contained"
               onClick={handleSearch}
               disabled={isSearching}
               sx={{ 
                 background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                 '&:hover': { 
                   background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                   transform: 'translateY(-1px)'
                 },
                 minWidth: 'auto',
                 boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
               }}
             >
               {isSearching ? <CircularProgress size={20} color="inherit" /> : 'Search'}
             </Button>
             
             <IconButton
               onClick={handleClearSearch}
               sx={{ 
                 bgcolor: 'rgba(255,255,255,0.9)',
                 color: '#8b4513',
                 '&:hover': { 
                   bgcolor: 'white', 
                   color: '#a0522d',
                   transform: 'translateY(-1px)'
                 },
                 boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)'
               }}
             >
               <Clear />
             </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

             <Container maxWidth="lg" sx={{ py: 3 }}>
         {/* Error Display */}
         {error && (
           <Alert severity="error" sx={{ 
             mb: 2,
             bgcolor: 'rgba(239, 68, 68, 0.1)',
             backdropFilter: 'blur(10px)',
             border: '1px solid rgba(239, 68, 68, 0.2)',
             boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)'
           }}>
             {error}
           </Alert>
         )}

         {/* Search Results */}
         {showSearchResults && (
           <Card sx={{ 
             mb: 3,
             background: 'rgba(255, 255, 255, 0.95)',
             backdropFilter: 'blur(20px)',
             border: '1px solid rgba(255, 255, 255, 0.2)',
             boxShadow: '0 8px 32px rgba(139, 69, 19, 0.1)'
           }}>
             <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Search />
                Search Results ({searchCount} found):
              </Typography>
              
              {searchResults.length > 0 ? (
                <List>
                  {searchResults.map((result, index) => (
                    <ListItem key={index} disablePadding>
                                             <ListItemButton
                         component="a"
                         href={`/files/${result.relative_path}/${result.file_name}`}
                         sx={{ 
                           borderLeft: '4px solid #f59e0b',
                           background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                           '&:hover': { 
                             background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
                             transform: 'translateX(4px)'
                           },
                           transition: 'all 0.2s ease-in-out'
                         }}
                       >
                        <ListItemIcon>
                          <InsertDriveFile />
                        </ListItemIcon>
                        <ListItemText
                          primary={result.file_name}
                          secondary={result.relative_path}
                          primaryTypographyProps={{ fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.85rem', color: '#6b7280' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                  No results found
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

                 {/* File List */}
         <Card sx={{
           background: 'rgba(255, 255, 255, 0.95)',
           backdropFilter: 'blur(20px)',
           border: '1px solid rgba(255, 255, 255, 0.2)',
           boxShadow: '0 8px 32px rgba(139, 69, 19, 0.1)'
         }}>
           <CardContent sx={{ p: 0 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading...</Typography>
              </Box>
            ) : (
              <List>
                {/* Navigation Row */}
                <ListItem disablePadding>
                  <ListItemButton
                    component="a"
                    href={getBackUrl()}
                    sx={{ borderBottom: '1px solid #d1d9e0' }}
                  >
                    <ListItemIcon>
                      <Folder color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={currentPath ? "(Go Back)" : "(Back to Home)"}
                      primaryTypographyProps={{ color: '#0969da' }}
                    />
                  </ListItemButton>
                </ListItem>

                {/* File/Directory List */}
                {files
                  .filter(file => file.name !== '.DS_Store' && !file.name.startsWith('.'))
                  .map((file, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton
                        component="a"
                        href={getNavigationUrl(currentPath, file.name, file.isDirectory)}
                        sx={{ 
                          borderBottom: index === files.length - 1 ? 'none' : '1px solid #d1d9e0',
                          '&:hover': { bgcolor: '#f6f8fa' }
                        }}
                      >
                        <ListItemIcon>
                          {getFileIcon(file.isDirectory)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={file.name}
                          primaryTypographyProps={{ color: '#0969da' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
              </List>
            )}
          </CardContent>
        </Card>

                 {/* Back to Home Button */}
         <Box sx={{ textAlign: 'center', mt: 3 }}>
           <Button
             variant="contained"
             href="/"
             startIcon={<Home />}
             sx={{ 
               background: '#1767ff',
               '&:hover': { 
                 background: '#0058ff',
               },
               boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
               px: 4,
               py: 1.5,
               color: 'white'
             }}
           >
             Back to Home
           </Button>
         </Box>
      </Container>
    </Box>
  );
};

export default FileBrowser; 