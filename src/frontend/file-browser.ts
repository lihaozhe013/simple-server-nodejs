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

function getCurrentDirectoryPath(): string {
  // Remove '/files' prefix and any leading/trailing slashes
  let pathname: string = window.location.pathname;
  if (pathname.startsWith('/files')) {
    let path: string = pathname.substring('/files'.length);
    if (path.startsWith('/')) path = path.substring(1);
    if (path.endsWith('/')) path = path.slice(0, -1);
    return decodeURIComponent(path);
  }
  return '';
}

async function fetchFiles(path: string = ''): Promise<void> {
  const res: Response = await fetch(`/api/list-files?path=${encodeURIComponent(path)}`);
  const files: FileEntry[] = await res.json();

  const list: HTMLElement | null = document.getElementById('file-list');
  if (!list) return;
  
  list.innerHTML = '';

  // Navigation row
  if (path) {
    const up: string = path.split('/').slice(0, -1).join('/');
    let upUrl: string = '/files';
    if (up) upUrl += '/' + encodeURIComponent(up).replace(/%2F/g, '/');
    if (!upUrl.endsWith('/')) upUrl += '/';
    list.innerHTML += 
      `<a href="${upUrl}" class="flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 text-blue-600 bg-white no-underline rounded-xl transition-colors">
        <img src="/icons/folder.svg" class="w-5 h-5 mr-3">
        (Go Back)
      </a>`;
  } else {
    list.innerHTML += 
      `<a href="/" class="flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 text-blue-600 bg-white no-underline rounded-xl transition-colors">
        <img src="/icons/document.svg" class="w-5 h-5 mr-3">
        (Back to Home)
      </a>`;
  }

  files.forEach((file: FileEntry) => {
    const isDir: boolean = file.isDirectory;
    const fullPath: string = path ? `${path}/${file.name}` : file.name;
    const displayName: string = file.name;
    const encodedPath: string = fullPath.split('/').map(encodeURIComponent).join('/');

    // Skip .DS_Store and files/directories that start with '.'
    if (displayName === '.DS_Store' || displayName.startsWith('.')) return;

    if (isDir) {
      const href: string = `/files/${encodedPath}/`;
      list.innerHTML += `
        <a href="${href}" class="flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 text-blue-600 bg-white no-underline rounded-xl transition-colors">
          <img src="/icons/folder.svg" class="w-5 h-5 mr-3">
          ${displayName}
        </a>`;
    } else {
      const videoAudioExts = [
        'mp4', 'mp3', 'wav', 'avi', 'mov', 'flac', 'ogg', 'm4a', 'webm', 'mkv', 'aac', 'wmv', '3gp', 'm4v', 'mpg', 'mpeg'
      ];
      const imageExts = [
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif', 'apng', 'avif', 'jfif', 'pjpeg', 'pjp', 'raw', 'heic', 'heif'
      ];
      const ext = displayName.split('.').pop()?.toLowerCase() || '';
      let icon = '/icons/document.svg';
      if (videoAudioExts.includes(ext)) {
        icon = '/icons/play-circle.svg';
      } else if (imageExts.includes(ext)) {
        icon = '/icons/photo.svg';
      }
      const filePath: string = `/files/${encodedPath}`;
      list.innerHTML += `
        <a href="${filePath}" class="flex items-center p-3 border-b border-gray-200 hover:bg-gray-50 text-gray-900 bg-white no-underline rounded-xl transition-colors">
          <img src="${icon}" class="w-5 h-5 mr-3">
          ${displayName}
        </a>`;
    }
  });

  // Add click event for folder navigation (SPA-like)
  list.querySelectorAll('a.file-row').forEach((a: Element) => {
    const anchor = a as HTMLAnchorElement;
    const href = anchor.getAttribute('href');
    if (href && href.startsWith('/files/') && href.endsWith('/')) {
      anchor.addEventListener('click', function (e: Event) {
        e.preventDefault();
        const targetHref = anchor.getAttribute('href');
        if (targetHref) {
          window.location.href = targetHref;
        }
      });
    }
  });
}

// Search functionality
async function searchFiles(fileName: string, currentDir: string = ''): Promise<void> {
  if (!fileName.trim()) {
    alert('Please enter a filename to search');
    return;
  }

  const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
  const searchResults = document.getElementById('search-results') as HTMLElement;
  const searchList = document.getElementById('search-list') as HTMLElement;

  // Show loading state
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';
  searchResults.style.display = 'block';
  searchList.innerHTML = '<div class="text-center p-4 text-gray-500 italic">Searching files...</div>';

  try {
    const encodedFileName = encodeURIComponent(fileName);
    const encodedCurrentDir = encodeURIComponent(currentDir);
    const url = `/api/search_feat/file_name=${encodedFileName}/current_dir=${encodedCurrentDir}`;
    
    const response = await fetch(url);
    const data: SearchResponse = await response.json();

    if (data.error) {
      searchList.innerHTML = `<div class="text-center p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl">Error: ${data.error}</div>`;
      return;
    }

    if (!data.results || data.count === 0) {
      searchList.innerHTML = `<div class="text-center p-4 text-gray-500 italic bg-gray-50 rounded-xl">No files found matching "${fileName}"</div>`;
      return;
    }

    // Display search results
    searchList.innerHTML = '';
    data.results.forEach((result: SearchResult) => {
      const videoAudioExts = [
        'mp4', 'mp3', 'wav', 'avi', 'mov', 'flac', 'ogg', 'm4a', 'webm', 'mkv', 'aac', 'wmv', '3gp', 'm4v', 'mpg', 'mpeg'
      ];
      const imageExts = [
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif', 'apng', 'avif', 'jfif', 'pjpeg', 'pjp', 'raw', 'heic', 'heif'
      ];
      const ext = result.file_name.split('.').pop()?.toLowerCase() || '';
      let icon = '/icons/document.svg';
      if (videoAudioExts.includes(ext)) {
        icon = '/icons/play-circle.svg';
      } else if (imageExts.includes(ext)) {
        icon = '/icons/photo.svg';
      }
      const fileUrl = `/files/${result.relative_path}/${result.file_name}`;
      searchList.innerHTML += `
        <a href="${fileUrl}" class="flex items-center p-3 border-l-4 border-blue-600 bg-gray-50 hover:bg-blue-50 mb-2 rounded-2xl transition-colors">
          <img src="${icon}" class="w-5 h-5 mr-3">
          <div class="flex flex-col">
            <div class="font-medium text-gray-900">${result.file_name}</div>
            <div class="text-xs text-gray-500">${result.relative_path}</div>
          </div>
        </a>`;
    });

    // Update results count
    const resultsHeader = searchResults.querySelector('h4');
    if (resultsHeader && data.count !== undefined) {
      resultsHeader.textContent = `Search Results (${data.count} found):`;
    }

  } catch (error) {
    console.error('Search error:', error);
    searchList.innerHTML = '<div class="text-center p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl">Search failed. Please try again.</div>';
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
  }
}

function clearSearch(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchResults = document.getElementById('search-results') as HTMLElement;
  
  searchInput.value = '';
  searchResults.style.display = 'none';
}

function initializeSearch(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-search-btn') as HTMLButtonElement;

  // Search button click
  searchBtn.addEventListener('click', () => {
    const fileName = searchInput.value.trim();
    const currentDir = getCurrentDirectoryPath();
    searchFiles(fileName, currentDir);
  });

  // Enter key in search input
  searchInput.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const fileName = searchInput.value.trim();
      const currentDir = getCurrentDirectoryPath();
      searchFiles(fileName, currentDir);
    }
  });

  // Clear button click
  clearBtn.addEventListener('click', clearSearch);
}

// Initialize everything
fetchFiles(getCurrentDirectoryPath());
initializeSearch();