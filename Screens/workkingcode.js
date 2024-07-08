// useEffect(() => {
//     const path = RNFS.ExternalStorageDirectoryPath;

//     const fetchMusicFiles = async (path, currentDepth = 0) => {
//       try {
//         const result = await RNFS.readDir(path);
//         const audioFiles = result.filter(file =>
//           file.isFile() &&
//           (file.name.endsWith('.mp3'))
//         );

//         const directories = result.filter(file => file.isDirectory());

//         await Promise.all(directories.map(async directory => {
//           await fetchMusicFiles(directory.path, currentDepth );
//         }));

//         setMusicFiles(prevState => [
//           ...prevState,
//           ...audioFiles.map(file => ({
//             name: file.name,
//             path: file.path,
//             size: file.size,
//             date: file.date,
//             length: file.length,
//             artist : file.artist,
//             album : file.album,
//           }))            
//         ]      
//       );
//     } catch (error) {
//         console.error('Directory Read Error: ', error);
//       }
//     };


// max 3 song code

// useEffect(() => {
//     const path = RNFS.ExternalStorageDirectoryPath;

//     const fetchMusicFiles = async (path, foundFiles = []) => {
//       try {
//         const result = await RNFS.readDir(path);
//         const audioFiles = result.filter(file =>
//           file.isFile() &&
//           (file.name.endsWith('.mp3'))
//         );

//         foundFiles.push(...audioFiles.map(file => ({
//           name: file.name,
//           path: file.path,
//           size: file.size,
//           date: file.date,
//           length: file.length,
//           artist: file.artist,
//           album: file.album,
//         })));

//         if (foundFiles.length >= 3) {
//           setMusicFiles(foundFiles.slice(0, 3));
//           setLoading(false);
//           return;
//         }

//         const directories = result.filter(file => file.isDirectory());

//         for (const directory of directories) {
//           await fetchMusicFiles(directory.path, foundFiles);
//           if (foundFiles.length >= 3) {
//             setMusicFiles(foundFiles.slice(0, 3));
//             setLoading(false);
//             return;
//           }
//         }
//       } catch (error) {
//         console.error('Directory Read Error: ', error);
//         setLoading(false);
//       }
//     };
