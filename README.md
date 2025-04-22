# WebFileTree

A browser-based disk space analyzer.

Available at : https://codehopperreddit.github.io/WebFileTree

## Features

- Fast directory scanning using the File System Access API
- Visual treemap representation of disk space usage
- Detailed file and folder listings with size information
- Simple, intuitive interface
- 100% client-side processing - no data leaves your browser


## Browser Compatibility

WebFileTree requires a browser that supports the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API). Currently, this includes:

- Google Chrome (version 86+)
- Microsoft Edge (version 86+)
- Opera (version 72+)

Unfortunately, Firefox and Safari do not currently support this API.

## How It Works

WebFileTree uses modern browser APIs to:

1. Request access to a folder on your computer
2. Scan the directory structure and calculate file sizes
3. Build a visualization of the space usage
4. Present the data in an interactive interface

All processing happens in your browser - no data is uploaded to any server.

## Limitations

- Depth limitation: For performance reasons, WebFileTree limits recursion to 10 directory levels
- Browser permissions: The browser will ask for permission each time you analyze a folder
- Performance: Large directories with many files may impact browser performance
- Temporary access: Browser access to the filesystem is temporary and must be re-authorized in each session

## Acknowledgements

- Icons from the [Feather Icons](https://feathericons.com/) project
