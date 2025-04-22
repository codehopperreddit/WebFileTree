// Check browser support
document.addEventListener('DOMContentLoaded', function() {
  if (!window.showDirectoryPicker) {
    document.getElementById('browser-warning').style.display = 'block';
  }
});

// Toggle help section
document.getElementById('help-btn').addEventListener('click', function() {
  const helpContent = document.getElementById('help-content');
  helpContent.classList.toggle('visible');
});

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    // Add active class to the clicked tab
    this.classList.add('active');
    
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    
    // Show the selected tab content
    const tabId = this.dataset.tab;
    document.getElementById(tabId + '-tab').style.display = 'block';
  });
});

// Global variables to store state
let fileTree = null;
let currentNode = null;
let fileTypeStats = {};

// File type definitions
const fileTypeDefinitions = {
  // Documents
  'pdf': { type: 'document', name: 'PDF Document', color: '#f87171' },
  'doc': { type: 'document', name: 'Word Document', color: '#60a5fa' },
  'docx': { type: 'document', name: 'Word Document', color: '#60a5fa' },
  'xls': { type: 'document', name: 'Excel Spreadsheet', color: '#34d399' },
  'xlsx': { type: 'document', name: 'Excel Spreadsheet', color: '#34d399' },
  'ppt': { type: 'document', name: 'PowerPoint', color: '#f97316' },
  'pptx': { type: 'document', name: 'PowerPoint', color: '#f97316' },
  'txt': { type: 'document', name: 'Text Document', color: '#9ca3af' },
  'rtf': { type: 'document', name: 'Rich Text Document', color: '#9ca3af' },
  
  // Images
  'jpg': { type: 'image', name: 'JPEG Image', color: '#818cf8' },
  'jpeg': { type: 'image', name: 'JPEG Image', color: '#818cf8' },
  'png': { type: 'image', name: 'PNG Image', color: '#a78bfa' },
  'gif': { type: 'image', name: 'GIF Image', color: '#c084fc' },
  'bmp': { type: 'image', name: 'Bitmap Image', color: '#d1d5db' },
  'svg': { type: 'image', name: 'SVG Image', color: '#93c5fd' },
  'webp': { type: 'image', name: 'WebP Image', color: '#93c5fd' },
  'tiff': { type: 'image', name: 'TIFF Image', color: '#bae6fd' },
  'tif': { type: 'image', name: 'TIFF Image', color: '#bae6fd' },
  
  // Videos
  'mp4': { type: 'video', name: 'MP4 Video', color: '#f472b6' },
  'avi': { type: 'video', name: 'AVI Video', color: '#fb7185' },
  'mkv': { type: 'video', name: 'MKV Video', color: '#f43f5e' },
  'mov': { type: 'video', name: 'QuickTime Video', color: '#e11d48' },
  'wmv': { type: 'video', name: 'Windows Media Video', color: '#be123c' },
  'flv': { type: 'video', name: 'Flash Video', color: '#ec4899' },
  'webm': { type: 'video', name: 'WebM Video', color: '#db2777' },
  
  // Audio
  'mp3': { type: 'audio', name: 'MP3 Audio', color: '#fb923c' },
  'wav': { type: 'audio', name: 'WAV Audio', color: '#fdba74' },
  'aac': { type: 'audio', name: 'AAC Audio', color: '#f97316' },
  'ogg': { type: 'audio', name: 'OGG Audio', color: '#ea580c' },
  'flac': { type: 'audio', name: 'FLAC Audio', color: '#ff4112' },
  
  // Archives
  'zip': { type: 'archive', name: 'ZIP Archive', color: '#22d3ee' },
  'rar': { type: 'archive', name: 'RAR Archive', color: '#67e8f9' },
  '7z': { type: 'archive', name: '7-Zip Archive', color: '#06b6d4' },
  'tar': { type: 'archive', name: 'TAR Archive', color: '#0891b2' },
  'gz': { type: 'archive', name: 'GZip Archive', color: '#0e7490' },
  
  // Executables and libraries
  'exe': { type: 'executable', name: 'Windows Executable', color: '#f87171' },
  'dll': { type: 'executable', name: 'Dynamic Link Library', color: '#fb923c' },
  'sys': { type: 'executable', name: 'System File', color: '#fbbf24' },
  'com': { type: 'executable', name: 'DOS Command', color: '#f59e0b' },
  'bat': { type: 'executable', name: 'Batch File', color: '#d97706' },
  'msi': { type: 'executable', name: 'Windows Installer', color: '#b45309' },
  
  // Data files
  'dat': { type: 'data', name: 'Data File', color: '#a3e635' },
  'db': { type: 'data', name: 'Database File', color: '#84cc16' },
  'xml': { type: 'data', name: 'XML File', color: '#65a30d' },
  'json': { type: 'data', name: 'JSON File', color: '#4d7c0f' },
  'csv': { type: 'data', name: 'CSV File', color: '#3f6212' },
  
  // Code and web
  'html': { type: 'code', name: 'HTML File', color: '#e879f9' },
  'css': { type: 'code', name: 'CSS File', color: '#d946ef' },
  'js': { type: 'code', name: 'JavaScript File', color: '#c026d3' },
  'php': { type: 'code', name: 'PHP File', color: '#a21caf' },
  'py': { type: 'code', name: 'Python File', color: '#86198f' },
  'c': { type: 'code', name: 'C Source File', color: '#701a75' },
  'cpp': { type: 'code', name: 'C++ Source File', color: '#7e22ce' },
  'java': { type: 'code', name: 'Java Source File', color: '#6b21a8' },
  'cs': { type: 'code', name: 'C# Source File', color: '#5b21b6' },
  'rb': { type: 'code', name: 'Ruby Source File', color: '#4c1d95' },
  'go': { type: 'code', name: 'Go Source File', color: '#4338ca' },
  'ts': { type: 'code', name: 'TypeScript File', color: '#3730a3' },
  
  // Fonts
  'ttf': { type: 'font', name: 'TrueType Font', color: '#94a3b8' },
  'otf': { type: 'font', name: 'OpenType Font', color: '#64748b' },
  'woff': { type: 'font', name: 'Web Open Font', color: '#475569' },
  'woff2': { type: 'font', name: 'Web Open Font 2', color: '#334155' }
};

// Folder colors
const folderColors = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#84cc16'  // green
];

// Convert bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Get file extension from name
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
}

// Get file type color and icon based on extension
function getFileTypeInfo(filename) {
  if (!filename.includes('.')) {
    return { 
      color: '#9ca3af', 
      icon: 'file', 
      type: 'unknown',
      name: 'Unknown File'
    };
  }
  
  const ext = getFileExtension(filename);
  const typeInfo = fileTypeDefinitions[ext] || { 
    type: 'other', 
    name: ext.toUpperCase() + ' File', 
    color: '#9ca3af' 
  };
  
  return {
    color: typeInfo.color,
    icon: typeInfo.type || 'file',
    type: typeInfo.type || 'other',
    name: typeInfo.name || (ext.toUpperCase() + ' File')
  };
}

// Get color for folder based on path (consistent colors for same folders)
function getFolderColor(path) {
  // Use string hash for consistent coloring
  let hash = 0;
  for (let i = 0; i < path.length; i++) {
    hash = ((hash << 5) - hash) + path.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Get folder depth to vary the color by level
  const depth = path.split('/').length - 1;
  const baseColor = folderColors[Math.abs(hash) % folderColors.length];
  
  // Adjust brightness based on depth
  const brightnessAdjust = Math.min(30, depth * 5);
  
  // Very basic brightness adjustment by return a CSS variable
  return `var(--folder-color-${(Math.abs(hash) % 5) + 1})`;
}

// Format date
function formatDate(date) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString(undefined, options);
}

// Format a small number of items
function formatCount(count) {
  return count.toLocaleString();
}

// Select folder button
document.getElementById('select-folder-btn').addEventListener('click', async function() {
  try {
    // Check if the File System Access API is available
    if (!window.showDirectoryPicker) {
      throw new Error("Your browser doesn't support the File System Access API. Please use Chrome, Edge, or Opera.");
    }
    
    // Clear previous error
    document.getElementById('error-container').innerHTML = '';
    
    // Reset file type statistics
    fileTypeStats = {};
    
    // Show progress
    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('progress-bar-fill').style.width = '0%';
    document.getElementById('progress-percentage').textContent = '0%';
    
    // Disable button during analysis
    this.disabled = true;
    this.textContent = 'Analyzing...';
    
    // Show directory picker
    const directoryHandle = await window.showDirectoryPicker();
    
    // Record the start time for scan duration calculation
    const scanStartTime = performance.now();
    
    // Start analyzing the directory
    const rootNode = {
      name: directoryHandle.name,
      path: directoryHandle.name,
      type: 'directory',
      size: 0,
      children: [],
      items: 0,
      files: 0,
      folders: 0,
      lastModified: new Date().toISOString()
    };
    
    let filesProcessed = 0;
    let foldersProcessed = 0;
    let totalFiles = 0;
    let totalFolders = 0;
    
    // First count passes (approximate)
    updateProgress(0, 'Scanning directory...');
    
    // Analyze directory recursively
    async function analyzeDirectory(dirHandle, node, depth = 0) {
      if (depth > 15) {
        return { size: 0, items: 0, files: 0, folders: 0 }; // Limit recursion depth for browser performance
      }
      
      let size = 0;
      let items = 0;
      let files = 0;
      let folders = 0;
      let lastModified = new Date(0).toISOString();
      
      try {
        for await (const entry of dirHandle.values()) {
          try {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              const fileSize = file.size;
              
              // Update file statistics by extension
              const ext = getFileExtension(entry.name);
              if (!fileTypeStats[ext]) {
                fileTypeStats[ext] = {
                  extension: ext,
                  size: 0,
                  count: 0,
                  typeInfo: getFileTypeInfo(entry.name)
                };
              }
              fileTypeStats[ext].size += fileSize;
              fileTypeStats[ext].count++;
              
              // Update last modified date
              if (file.lastModified) {
                const fileDate = new Date(file.lastModified).toISOString();
                if (fileDate > lastModified) {
                  lastModified = fileDate;
                }
              }
              
              node.children.push({
                name: entry.name,
                path: `${node.path}/${entry.name}`,
                type: 'file',
                size: fileSize,
                children: [],
                items: 0,
                files: 0,
                folders: 0,
                lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString()
              });
              
              size += fileSize;
              items++;
              files++;
              totalFiles++;
              filesProcessed++;
              
              if (filesProcessed % 10 === 0) {
                updateProgress(Math.min(99, Math.floor((filesProcessed / (totalFiles || 1)) * 100)), 
                               `Processed ${filesProcessed.toLocaleString()} files, ${foldersProcessed.toLocaleString()} folders...`);
              }
            } else if (entry.kind === 'directory') {
              const childNode = {
                name: entry.name,
                path: `${node.path}/${entry.name}`,
                type: 'directory',
                size: 0,
                children: [],
                items: 0,
                files: 0,
                folders: 0,
                lastModified: new Date().toISOString()
              };
              
              node.children.push(childNode);
              const stats = await analyzeDirectory(entry, childNode, depth + 1);
              
              childNode.size = stats.size;
              childNode.items = stats.items;
              childNode.files = stats.files;
              childNode.folders = stats.folders;
              childNode.lastModified = stats.lastModified;
              
              // Update node's last modified date if child is newer
              if (stats.lastModified > lastModified) {
                lastModified = stats.lastModified;
              }
              
              size += stats.size;
              items += stats.items + 1; // +1 for the folder itself
              files += stats.files;
              folders += stats.folders + 1; // +1 for the folder itself
              
              totalFolders++;
              foldersProcessed++;
            }
          } catch (err) {
            console.error(`Error processing ${entry.name}:`, err);
          }
        }
      } catch (err) {
        console.error(`Error reading directory entries:`, err);
      }
      
      node.size = size;
      node.items = items;
      node.files = files;
      node.folders = folders;
      node.lastModified = lastModified;
      
      return { size, items, files, folders, lastModified };
    }
    
    const stats = await analyzeDirectory(directoryHandle, rootNode);
    rootNode.items = stats.items;
    rootNode.files = stats.files;
    rootNode.folders = stats.folders;
    
    // Sort all children by size (largest first)
    function sortTree(node) {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => b.size - a.size);
        node.children.forEach(sortTree);
      }
    }
    
    sortTree(rootNode);
    
    // Store tree and current node
    fileTree = rootNode;
    currentNode = rootNode;
    
    // Update details tab statistics
    document.getElementById('folder-count').textContent = formatCount(rootNode.folders);
    document.getElementById('file-count').textContent = formatCount(rootNode.files);
    
    if (rootNode.files > 0) {
      document.getElementById('avg-file-size').textContent = formatBytes(rootNode.size / rootNode.files);
    }
    
    // Update file type statistics
    if (Object.keys(fileTypeStats).length > 0) {
      // Find largest and most common type
      let largestType = { extension: '', size: 0 };
      let mostCommonType = { extension: '', count: 0 };
      
      for (const ext in fileTypeStats) {
        if (fileTypeStats[ext].size > largestType.size) {
          largestType = fileTypeStats[ext];
        }
        
        if (fileTypeStats[ext].count > mostCommonType.count) {
          mostCommonType = fileTypeStats[ext];
        }
      }
      
      document.getElementById('file-types-count').textContent = Object.keys(fileTypeStats).length;
      document.getElementById('largest-type').textContent = (largestType.extension || '-') + 
                                                            ` (${formatBytes(largestType.size)})`;
      document.getElementById('most-common-type').textContent = (mostCommonType.extension || '-') + 
                                                               ` (${formatCount(mostCommonType.count)} files)`;
    }
    
    // Calculate scan duration
    const scanEndTime = performance.now();
    const scanDuration = (scanEndTime - scanStartTime) / 1000; // Convert to seconds
    
    // Update UI with results
    updateProgress(100, 'Analysis complete');
    document.getElementById('result-container').style.display = 'block';
    
    // Update statistics
    document.getElementById('folder-size').textContent = formatBytes(rootNode.size);
    document.getElementById('files-scanned').textContent = formatCount(rootNode.files);
    document.getElementById('folders-scanned').textContent = formatCount(rootNode.folders);
    document.getElementById('scan-time').textContent = scanDuration.toFixed(2) + ' sec';
    
    // Render visualizations
    renderTreeMap(rootNode);
    renderFileList(rootNode, rootNode);
    renderDirectoryTree(rootNode);
    renderFileTypes();
    updatePathDisplay(rootNode);
    
  } catch (err) {
    // Show error
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `
      <div class="alert alert-danger">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        ${err.message}
      </div>
    `;
    
    document.getElementById('progress-container').style.display = 'none';
    console.error("Error analyzing directory:", err);
  } finally {
    // Re-enable button
    this.disabled = false;
    this.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
        <path d="M21 15V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v0"></path>
        <path d="M2 15V8a2 2 0 0 1 2-2h3.9"></path>
        <rect x="2" y="15" width="19" height="6" rx="2"></rect>
      </svg>
      Select Folder
    `;
  }
});

// Search functionality
document.getElementById('search-input').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  
  if (currentNode) {
    renderFileList(fileTree, currentNode, searchTerm);
  }
});

// Filter by type
document.getElementById('filter-type').addEventListener('change', function() {
  if (currentNode) {
    renderFileList(fileTree, currentNode);
  }
});

// Sort functionality
document.getElementById('sort-by').addEventListener('change', function() {
  if (currentNode) {
    renderFileList(fileTree, currentNode);
  }
});

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', function() {
  if (fileTree && currentNode) {
    renderTreeMap(fileTree);
    renderFileList(fileTree, currentNode);
    renderDirectoryTree(fileTree);
    renderFileTypes();
  }
});

// Sort headers click handlers
document.getElementById('sort-name').addEventListener('click', function() {
  const select = document.getElementById('sort-by');
  if (select.value === 'name-asc') {
    select.value = 'name-desc';
  } else {
    select.value = 'name-asc';
  }
  
  if (currentNode) {
    renderFileList(fileTree, currentNode);
  }
});

document.getElementById('sort-size').addEventListener('click', function() {
  const select = document.getElementById('sort-by');
  if (select.value === 'size-desc') {
    select.value = 'size-asc';
  } else {
    select.value = 'size-desc';
  }
  
  if (currentNode) {
    renderFileList(fileTree, currentNode);
  }
});

// Update progress bar
function updateProgress(percentage, text) {
  document.getElementById('progress-bar-fill').style.width = `${percentage}%`;
  document.getElementById('progress-percentage').textContent = `${percentage}%`;
  
  if (text) {
    document.getElementById('progress-text').textContent = text;
  }
}

// Render directory tree view
function renderDirectoryTree(rootNode) {
  const container = document.getElementById('directory-tree');
  container.innerHTML = '';
  
  // Recursively build the tree
  function buildTreeItem(node, depth = 0) {
    const item = document.createElement('div');
    item.className = 'treeview-item';
    if (node === currentNode) {
      item.classList.add('selected');
    }
    
    item.innerHTML = `
      ${'<span class="treeview-indent"></span>'.repeat(depth)}
      <span class="treeview-toggle">${node.children.some(c => c.type === 'directory') ? '▶' : ''}</span>
      <span class="treeview-label">${node.name}</span>
    `;
    
    item.addEventListener('click', function() {
      navigateToNode(node);
    });
    
    container.appendChild(item);
    
    // Add children (only directories)
    if (node.type === 'directory') {
      node.children
        .filter(child => child.type === 'directory')
        .forEach(child => {
          buildTreeItem(child, depth + 1);
        });
    }
  }
  
  buildTreeItem(rootNode);
}

// Render treemap visualization with improved layout and colors
function renderTreeMap(rootNode) {
  const container = document.getElementById('treemap-container');
  container.innerHTML = '';
  
  // Get container dimensions
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  // Use an improved version of the squarified treemap algorithm
  function createTreemap(node, x, y, width, height, level = 0) {
    // Skip if dimensions are too small
    if (width < 5 || height < 5) return;
    
    // Skip if node has no children
    if (!node.children || node.children.length === 0) return;
    
    const total = node.size || 1; // Avoid division by zero
    
    // Sort children by size (largest first)
    const children = [...node.children]
      .sort((a, b) => b.size - a.size)
      .filter(child => (child.size / total) > 0.003); // Filter out very small nodes
    
    // If there are too many children, keep only the largest ones and create an "Other" node
    const maxNodes = 25; // Limit to prevent overcrowding
    
    let others = null;
    if (children.length > maxNodes) {
      const visibleChildren = children.slice(0, maxNodes);
      const otherChildren = children.slice(maxNodes);
      
      if (otherChildren.length > 0) {
        const otherSize = otherChildren.reduce((sum, child) => sum + child.size, 0);
        
        if (otherSize > 0) {
          others = {
            name: `${otherChildren.length} other items`,
            path: node.path + '/[others]',
            type: 'other',
            size: otherSize,
            children: otherChildren,
            items: otherChildren.reduce((sum, child) => sum + (child.items || 0), 0),
            files: otherChildren.reduce((sum, child) => sum + (child.files || 0), 0),
            folders: otherChildren.reduce((sum, child) => sum + (child.folders || 0), 0),
          };
          
          visibleChildren.push(others);
        }
      }
      
      children.length = 0;
      children.push(...visibleChildren);
    }
    
    // Layout rectangles using a modified squarified algorithm
    let remainingX = x;
    let remainingY = y;
    let remainingWidth = width;
    let remainingHeight = height;
    
    // Use the aspect ratio to decide whether to lay out horizontally or vertically
    const isHorizontal = width > height;
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const ratio = child.size / total;
      
      let childWidth, childHeight, childX, childY;
      
      if (isHorizontal) {
        childWidth = remainingWidth * ratio;
        childHeight = remainingHeight;
        childX = remainingX;
        childY = remainingY;
        remainingX += childWidth;
      } else {
        childWidth = remainingWidth;
        childHeight = remainingHeight * ratio;
        childX = remainingX;
        childY = remainingY;
        remainingY += childHeight;
      }
      
      // Create rectangle for this child
      let color;
      let borderColor = 'rgba(0, 0, 0, 0.3)';
      
      if (child.type === 'directory') {
        color = getFolderColor(child.path);
      } else if (child.type === 'other') {
        color = '#4b5563'; // Gray for "Other" nodes
      } else {
        // For files, color by type
        const fileInfo = getFileTypeInfo(child.name);
        color = fileInfo.color;
      }
      
      const nodeElement = document.createElement('div');
      nodeElement.className = 'treemap-node';
      nodeElement.style.left = `${childX}px`;
      nodeElement.style.top = `${childY}px`;
      nodeElement.style.width = `${childWidth}px`;
      nodeElement.style.height = `${childHeight}px`;
      nodeElement.style.backgroundColor = color;
      nodeElement.style.borderColor = borderColor;
      
      // Add text label if there's enough space
      if (childWidth > 40 && childHeight > 25) {
        const labelElement = document.createElement('div');
        labelElement.className = 'treemap-label';
        
        if (childWidth > 80 && childHeight > 30) {
          labelElement.innerHTML = `
            ${child.name}
            <div class="treemap-size">${formatBytes(child.size)}</div>
          `;
        } else {
          labelElement.textContent = child.name;
        }
        
        nodeElement.appendChild(labelElement);
      }
      
      // Add data attributes for hover info
      nodeElement.dataset.name = child.name;
      nodeElement.dataset.size = formatBytes(child.size);
      nodeElement.dataset.percentage = ((child.size / total) * 100).toFixed(1) + '%';
      
      // Add click handler to navigate to this node
      nodeElement.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateToNode(child);
      });
      
      container.appendChild(nodeElement);
      
      // Recursively create treemap for this child's children if it's a directory
      if ((child.type === 'directory' || child.type === 'other') && 
          child.children && child.children.length > 0) {
        // Only recurse if the area is large enough
        if (childWidth > 80 && childHeight > 60) {
          // Add some padding for visual clarity
          const padding = 4;
          createTreemap(
            child,
            childX + padding,
            childY + padding,
            childWidth - padding * 2,
            childHeight - padding * 2,
            level + 1
          );
        }
      }
    }
  }
  
  // Create treemap starting with the current node
  createTreemap(currentNode, 0, 0, containerWidth, containerHeight);
}

// Render file list with improved sorting and filtering
function renderFileList(rootNode, currentFolder, searchTerm = '') {
  const fileListContent = document.getElementById('file-list-content');
  fileListContent.innerHTML = '';
  
  // Get filter and sort options
  const filterType = document.getElementById('filter-type').value;
  const sortBy = document.getElementById('sort-by').value;
  
  // Update folder name
  document.getElementById('current-folder-name').textContent = currentFolder.name;
  
  // Add parent directory link if not at root
  if (currentFolder !== rootNode) {
    const parentPath = currentFolder.path.split('/').slice(0, -1).join('/');
    const parentNode = findNodeByPath(rootNode, parentPath);
    
    if (parentNode) {
      const parentElement = document.createElement('div');
      parentElement.className = 'file-list-item go-up';
      parentElement.innerHTML = `
        <div class="file-type-icon" style="background-color: var(--primary-color);">
          <svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
        <div class="file-name">..</div>
        <div class="file-size">-</div>
        <div class="file-percentage">-</div>
        <div class="file-count">-</div>
        <div class="file-date">-</div>
      `;
      
      parentElement.addEventListener('click', function() {
        navigateToNode(parentNode);
      });
      
      fileListContent.appendChild(parentElement);
    }
  }
  
  // Helper function to match search term
  function matchesSearch(child, term) {
    if (!term) return true;
    return child.name.toLowerCase().includes(term);
  }
  
  // Helper function to match filter
  function matchesFilter(child, filter) {
    if (filter === 'all') return true;
    if (filter === 'directory' && child.type === 'directory') return true;
    if (filter === 'large' && child.size > 10 * 1024 * 1024) return true; // Larger than 10MB
    
    if (child.type === 'file') {
      const fileInfo = getFileTypeInfo(child.name);
      return fileInfo.type === filter;
    }
    
    return false;
  }
  
  // Filter and sort children
  let children = currentFolder.children
    .filter(child => matchesSearch(child, searchTerm))
    .filter(child => matchesFilter(child, filterType));
  
  // Sort children based on selected option
  switch (sortBy) {
    case 'size-desc':
      children.sort((a, b) => b.size - a.size);
      break;
    case 'size-asc':
      children.sort((a, b) => a.size - b.size);
      break;
    case 'name-asc':
      children.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      children.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'type-asc':
      children.sort((a, b) => {
        const aExt = a.type === 'file' ? getFileExtension(a.name) : '';
        const bExt = b.type === 'file' ? getFileExtension(b.name) : '';
        return aExt.localeCompare(bExt) || a.name.localeCompare(b.name);
      });
      break;
  }
  
  // Add children
  children.forEach(child => {
    const percentage = (child.size / (currentFolder.size || 1)) * 100;
    const isDirectory = child.type === 'directory';
    
    // Get file type info
    let icon, iconColor;
    
    if (isDirectory) {
      icon = `
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      iconColor = getFolderColor(child.path);
    } else {
      const fileInfo = getFileTypeInfo(child.name);
      iconColor = fileInfo.color;
      
      // First character of extension for the icon
      const ext = getFileExtension(child.name);
      icon = ext.substring(0, 1).toUpperCase();
    }
    
    const childElement = document.createElement('div');
    childElement.className = 'file-list-item';
    childElement.innerHTML = `
      <div class="file-type-icon" style="background-color: ${iconColor};">
        ${isDirectory ? icon : icon}
      </div>
      <div class="file-name">
        ${child.name}
        ${!isDirectory ? `<span class="file-extension">.${getFileExtension(child.name)}</span>` : ''}
      </div>
      <div class="file-size">${formatBytes(child.size)}</div>
      <div class="file-percentage">
        <div class="percentage-bar">
          <div class="percentage-bar-fill" style="width: ${percentage}%; background-color: ${iconColor};"></div>
        </div>
        <span>${percentage.toFixed(1)}%</span>
      </div>
      <div class="file-count">${isDirectory ? formatCount(child.items) : '-'}</div>
      <div class="file-date">${child.lastModified ? formatDate(child.lastModified) : '-'}</div>
    `;
    
    childElement.addEventListener('click', function() {
      navigateToNode(child);
    });
    
    fileListContent.appendChild(childElement);
  });
  
  // Show a message if no results
  if (children.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.style.padding = '1rem';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.color = 'var(--text-light)';
    
    if (searchTerm) {
      emptyMessage.textContent = `No items matching "${searchTerm}"`;
    } else if (filterType !== 'all') {
      emptyMessage.textContent = `No ${filterType} items found in this folder`;
    } else {
      emptyMessage.textContent = 'This folder is empty';
    }
    
    fileListContent.appendChild(emptyMessage);
  }
}

// Render file types list
function renderFileTypes() {
  if (!fileTypeStats) return;
  
  const container = document.getElementById('file-types-content');
  container.innerHTML = '';
  
  // Convert to array and sort by size
  const typeArray = Object.values(fileTypeStats).sort((a, b) => b.size - a.size);
  const totalSize = typeArray.reduce((sum, item) => sum + item.size, 0);
  
  typeArray.forEach(typeInfo => {
    const percentage = (typeInfo.size / totalSize) * 100;
    
    const item = document.createElement('div');
    item.className = 'file-list-item';
    item.innerHTML = `
      <div class="file-type-icon" style="background-color: ${typeInfo.typeInfo.color};">
        ${typeInfo.extension.substring(0, 1).toUpperCase()}
      </div>
      <div class="file-name">
        .${typeInfo.extension}
      </div>
      <div class="file-size">${formatBytes(typeInfo.size)}</div>
      <div class="file-percentage">
        <div class="percentage-bar">
          <div class="percentage-bar-fill" style="width: ${percentage}%; background-color: ${typeInfo.typeInfo.color};"></div>
        </div>
        <span>${percentage.toFixed(1)}%</span>
      </div>
      <div class="file-count">${formatCount(typeInfo.count)}</div>
      <div>${typeInfo.typeInfo.name}</div>
    `;
    
    container.appendChild(item);
  });
}

// Update path display with clickable segments
function updatePathDisplay(node) {
  const pathDisplay = document.getElementById('path-display');
  pathDisplay.innerHTML = '';
  
  // Add folder icon
  const folderIcon = document.createElement('span');
  folderIcon.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  pathDisplay.appendChild(folderIcon);
  
  const pathParts = node.path.split('/');
  
  // Add root
  const rootSegment = document.createElement('span');
  rootSegment.className = 'path-segment';
  rootSegment.textContent = pathParts[0];
  rootSegment.addEventListener('click', function() {
    navigateToNode(fileTree);
  });
  pathDisplay.appendChild(rootSegment);
  
  // Add path segments
  let currentPath = pathParts[0];
  
  for (let i = 1; i < pathParts.length; i++) {
    // Add separator
    const separator = document.createElement('span');
    separator.className = 'path-separator';
    separator.textContent = '/';
    pathDisplay.appendChild(separator);
    
    // Add segment
    currentPath += '/' + pathParts[i];
    
    const segment = document.createElement('span');
    segment.className = 'path-segment';
    segment.textContent = pathParts[i];
    
    // Create a closure to capture the current path
    (function(path) {
      segment.addEventListener('click', function() {
        const targetNode = findNodeByPath(fileTree, path);
        if (targetNode) {
          navigateToNode(targetNode);
        }
      });
    })(currentPath);
    
    pathDisplay.appendChild(segment);
  }
}

// Navigate to a node in the file tree
function navigateToNode(node) {
  if (node.type === 'directory' || node.type === 'other') {
    currentNode = node;
    
    renderTreeMap(fileTree);
    renderFileList(fileTree, node);
    renderDirectoryTree(fileTree);
    updatePathDisplay(node);
    
    // Reset search
    document.getElementById('search-input').value = '';
  }
}

// Find node by path
function findNodeByPath(rootNode, path) {
  if (rootNode.path === path) {
    return rootNode;
  }
  
  if (!rootNode.children) {
    return null;
  }
  
  for (const child of rootNode.children) {
    const found = findNodeByPath(child, path);
    if (found) {
      return found;
    }
  }
  
  return null;
}

// Handle window resize to redraw the treemap
window.addEventListener('resize', function() {
  if (fileTree && currentNode) {
    renderTreeMap(fileTree);
  }
});