import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFileTree, updateFileContent, deleteFileFromProject, renameFileInProject } from '../../store/file';
import debounce from 'lodash.debounce';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getWebContainer } from '@/config/webContainer';
import { FilePlus, FilePlus2 } from 'lucide-react';
import { getSocket } from '@/config/socket';

const Editor = ({ projectId }) => {

  const dispatch = useDispatch();
  const { FileTrees } = useSelector((state) => state.files);

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [localContent, setLocalContent] = useState('');


  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');


  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  const [webContainer, setWebContainer] = useState(null);

  const [iframeUrl, setIframeUrl] = useState(null);
  const [iframeVisible, setIframeVisible] = useState(false);
  const [runProcess, setRunProcess] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
const terminalRef = useRef(null);



  const menuRef = useRef(null);
  const renameInputRef = useRef(null);
  const newFileInputRef = useRef(null);

const appendToTerminal = (chunk) => {
  setTerminalOutput(prev => prev + chunk);
  setIsTerminalVisible(true);
};


useEffect(() => {
  if (terminalRef.current) {
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }
  console.log(terminalOutput,"ye termianl output h")
}, [terminalOutput]);

useEffect(() => {
  const socket = getSocket();
  if (!socket || !projectId) return;

  const handleFileTreeUpdate = () => {
    console.log("fileTreeUpdated received in Editor");
    dispatch(fetchFileTree(projectId));
  };

  socket.on('fileTreeUpdated', handleFileTreeUpdate)

  return () => {
    socket.off('fileTreeUpdated', handleFileTreeUpdate);
  };
}, [projectId, dispatch]);




  useEffect(() => {
    if (projectId) {
      dispatch(fetchFileTree(projectId));
    }
    webContainer?.mount(FileTrees)


  }, [dispatch, projectId])

  const fileKeys = useMemo(() => Object.keys(FileTrees), [FileTrees]);


  const debouncedSave = useMemo(() =>
    debounce((filename, content) => {
      if (projectId && filename) {
        dispatch(updateFileContent({ projectId, filename, content }));
      }
    }, 1000), [dispatch, projectId]
  );

  useEffect(() => () => debouncedSave.flush(), [debouncedSave]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpenFor && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenFor(null);
      }

      if (renamingFile && renameInputRef.current && !renameInputRef.current.contains(e.target)) {
        setRenamingFile(null);
      }

      if (showNewFileInput && newFileInputRef.current && !newFileInputRef.current.contains(e.target)) {
        setShowNewFileInput(false);
        setNewFileName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenFor, renamingFile, showNewFileInput]);

  const handleOpenFile = (filename) => {
    if (currentFile && localContent !== FileTrees[currentFile]?.file?.contents) {
      debouncedSave(currentFile, localContent);
    }

    if (!openFiles.includes(filename)) {
      setOpenFiles((prev) => [...prev, filename]);
    }
    setCurrentFile(filename);
    setLocalContent(FileTrees[filename]?.file?.contents || '');


    setMenuOpenFor(null);
    setRenamingFile(null);
  };

  const handleCloseFile = (filenameToClose) => {
    setOpenFiles((prev) => {
      const updated = prev.filter((f) => f !== filenameToClose);
      if (currentFile === filenameToClose) {
        const newCurrent = updated[updated.length - 1] || null;
        setCurrentFile(newCurrent);
        setLocalContent(newCurrent ? FileTrees[newCurrent]?.file?.contents || '' : '');
      }
      return updated;
    });
  };

  const handleChange = (e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    debouncedSave(currentFile, newContent);
  };


  const handleNewFileClick = () => {
    setShowNewFileInput(true);
    setMenuOpenFor(null);
    setRenamingFile(null);
  };

  const handleCreateFile = () => {
    const trimmedName = newFileName.trim();
    if (!trimmedName) {
      toast.error('Please enter Filename', { position: 'bottom-right' });
      return;
    }

    if (fileKeys.includes(trimmedName)) {
      toast.error('File already exists', { position: 'bottom-right' });
      return;
    }

    dispatch(updateFileContent({ projectId, filename: trimmedName, content: '' }));
    setCurrentFile(trimmedName);
    setOpenFiles((prev) => [...prev, trimmedName]);
    setLocalContent('');
    setNewFileName('');
    setShowNewFileInput(false);
  };


  const toggleMenu = (filename) => {
    if (menuOpenFor === filename) {
      setMenuOpenFor(null);
    } else {
      setMenuOpenFor(filename);
      setRenamingFile(null);
      setShowNewFileInput(false);
    }
  };


  const startRenaming = (filename) => {
    setRenamingFile(filename);
    setRenameInputValue(filename);
    setMenuOpenFor(null);
  };

  const onRenameChange = (e) => {
    setRenameInputValue(e.target.value);
  };

  const confirmRename = () => {
    const trimmed = renameInputValue.trim();
    if (!trimmed) {
      toast.error('Filename cannot be empty', { position: 'bottom-right' });
      return;
    }
    if (fileKeys.includes(trimmed)) {
      toast.error('Filename already exists', { position: 'bottom-right' });
      return;
    }
    dispatch(renameFileInProject({ projectId, oldFilename: renamingFile, newFilename: trimmed }));
    if (currentFile === renamingFile) {
      setCurrentFile(trimmed);
      setLocalContent(FileTrees[trimmed]?.file?.contents || '');
    }
    setRenamingFile(null);
  };

  const onRenameKeyDown = (e) => {
    if (e.key === 'Enter') confirmRename();
    if (e.key === 'Escape') setRenamingFile(null);
  };


  const handleDelete = async (filename) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    dispatch(deleteFileFromProject({ projectId, filename }));
    setMenuOpenFor(null);

    if (openFiles.includes(filename)) handleCloseFile(filename);
    if (currentFile === filename) {
      setCurrentFile(null);
      setLocalContent('');
    }

  };

  const closeIframe = () => {
    setIframeVisible(false);
    setIframeUrl(null);
  };

  useEffect(() => {
    if (currentFile) {
      setLocalContent(FileTrees[currentFile]?.file?.contents || '')
    }
  }, [currentFile, FileTrees]);

useEffect(() => {
  if (!webContainer) {
    getWebContainer().then(container => {
      setWebContainer(container);
      console.log("container started");
    });
  }
}, []);




  return (
    <>
      <aside className="w-1/4 bg-gray-800 text-gray-100 p-4 overflow-y-auto hidden md:block relative max-w-48">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Explorer</h3>
          <button
            className="text-xs  px-2 py-1 rounded hover:bg-slate-700"
            onClick={handleNewFileClick}
          >
            <FilePlus />
          </button>
        </div>

        {showNewFileInput && (
          <div
            ref={newFileInputRef}
            className="mb-2 flex gap-2"
            style={{ position: 'relative', zIndex: 20 }}
          >
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name..."
              className="text-black text-xs w-full px-2 py-1 rounded"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              autoFocus
            />
            <div className="flex justify-end mt-1">
              <button
                onClick={handleCreateFile}
                className="text-xs bg-teal-600 p-2 py-0.5 rounded hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-1 text-xs relative">
          {fileKeys.map((file) => (
            <li
              key={file}
              className="px-2 py-1 rounded hover:bg-gray-700 flex justify-between items-center relative"
            >
              {renamingFile === file ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameInputValue}
                  onChange={onRenameChange}
                  onKeyDown={onRenameKeyDown}
                  onBlur={confirmRename}
                  autoFocus
                  className="text-black text-xs w-full px-2 py-1 rounded"
                />
              ) : (
                <>
                  <button
                    onClick={() => handleOpenFile(file)}
                    className="w-full text-left truncate"
                    title={file}
                  >
                    {file}
                  </button>
                  <button
                    onClick={() => toggleMenu(file)}
                    className="text-gray-400 hover:text-white px-2"
                    aria-label={`Options for ${file}`}
                  >
                    ⋮
                  </button>
                </>
              )}

              {menuOpenFor === file && renamingFile !== file && (
                <div
                  ref={menuRef}
                  className="absolute right-2 top-full mt-1 bg-gray-900 border border-gray-700 rounded shadow-md z-30 w-28 text-xs"
                >
                  <button
                    onClick={() => startRenaming(file)}
                    className="block w-full text-left px-3 py-1 hover:bg-gray-700"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="block w-full text-left px-3 py-1 hover:bg-red-700 text-red-400 hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 bg-gray-700 text-green-200 overflow-auto flex flex-col">
        {iframeVisible && iframeUrl && (

          <div
            className="fixed inset-0 z-50 text-white bg-slate-200 bg-opacity-90 flex flex-col"
            style={{ backdropFilter: 'blur(5px)' }}
          >
            <div className="flex w-full  px-0">
              <div className='address-bar w-full'>
                <input type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl} className='w-full p-2 px-4 bg-slate-900'
                />
              </div>
              <button
                onClick={closeIframe}
                className="text-black text-xl font-bold px-4 py-1 bg-white rounded hover:bg-red-700"
                aria-label="Close iframe"
              >
                ✕
              </button>
            </div>
            <iframe
              src={iframeUrl}
              className="flex-1 w-full"
              style={{ border: 'none' }}
              title="Run Preview"
            />
          </div>
        )}
        <div className="flex bg-gray-800 border-b border-gray-700 h-9 overflow-x-auto justify-between items-center">
          <div className='flex '>
            {openFiles.length > 0 && openFiles.map((file, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-1 px-3 py-1 cursor-pointer ${currentFile === file ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
                  }`}
              >
                <button onClick={() => handleOpenFile(file)} className="font-medium truncate" title={file}>
                  {file}
                </button>
                <button
                  onClick={() => handleCloseFile(file)}
                  className="text-gray-500 hover:text-red-400"
                  title="Close"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

<div className='actions flex gap-1 h-6'>
    <button
    onClick={() => setIsTerminalVisible(prev => !prev)}
    className='px-3 rounded-sm bg-slate-100 text-black hover:bg-slate-300'
  >
    Terminal
  </button>
  <button
    onClick={async () => {
      setTerminalOutput('');
      webContainer.mount(FileTrees);

      const installProcess = await webContainer.spawn("npm", ["install"]);
      installProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          appendToTerminal(chunk);
        }
      }));

      if (runProcess) runProcess.kill();

      const tempRunProcess = await webContainer.spawn("npm", ["start"]);
      tempRunProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          appendToTerminal(chunk);
        }
      }));

      setRunProcess(tempRunProcess);

      webContainer.on('server-ready', (port, url) => {
        setIframeUrl(url);
        setIframeVisible(true);
      });
    }}
    className='px-3 rounded-sm bg-slate-100 text-black hover:bg-slate-300'
  >
    Run
  </button>


</div>


        </div>


        <div className="flex-1 overflow-y-auto">
          {currentFile ? (
            <textarea
              className="w-full h-full p-4 bg-slate-700 resize-none outline-none font-mono text-sm"
              value={localContent}
              onChange={handleChange}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 italic">
              Select a file from the Explorer to view/edit
            </div>
          )}
        </div>


{isTerminalVisible && (
  <div
  className="bg-black text-slate-400 text-xs font-mono p-2 h-60 border-t border-gray-700 relative overflow-hidden"
  ref={terminalRef}
>
  <button
    onClick={() => setIsTerminalVisible(false)}
    className="absolute top-2 right-2 text-white hover:text-red-500 text-sm z-10"
    title="Close Terminal"
  >
    ✕
  </button>

  <div className="w-full h-full overflow-auto">
    <pre className="whitespace-pre-wrap break-all">{terminalOutput || 'Terminal ready...'}</pre>
  </div>
</div>

)}





      </main>
    </>
  );
};

export default Editor;  