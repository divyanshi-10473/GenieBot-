import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { disconnectSocket, initializeSocket, recieveMessage, sendMessage } from '@/config/socket';
import '../index.css'
import Markdown from 'markdown-to-jsx'

import { Input } from '@/components/ui/input';
import { useDispatch, useSelector } from 'react-redux';

import toast from 'react-hot-toast';

import { useParams } from 'react-router-dom';
import { fetchMessagesByProject, sendMessages } from '../../store/message';
import AddCollab from '@/components/add-collab';


const Chatroom = () => {
  const { user } = useSelector((state) => state.auth);
  const { messagesList } = useSelector((state) => state.message);
  const msgEndRef = useRef(null);
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);





  const scrollToBottom = () => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const handleSendMessage = () => {
    if (!message.trim()) return;
    const payload = {
      message: message.trim(),
      sender: user,
      timestamp: new Date().toISOString()
    };
    sendMessage('project-message', payload)
    setMessages((prev) => [...prev, payload])
    setMessage(''); 

    dispatch(sendMessages({ projectId, content: message.trim() }))
      .unwrap()
      .then(() => {
        dispatch(fetchMessagesByProject(projectId)).then(() => scrollToBottom());
      })
      .catch(err => {
        toast.error(err || 'Failed to send AI message');
      });

    scrollToBottom();

  };



function WriteAiMessage(message) {
  try {
    const messageObject = JSON.parse(message);

    return (
      <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
        <Markdown>{messageObject.text}</Markdown>
      </div>
    );
  } catch (err) {
    console.log("Error parsing AI message:", err);
    return (
      <div className="text-red-500 text-sm">
        Failed to render AI response.
      </div>
    );
  }
}




useEffect(() => {
  const mergedFiles = {};

  messagesList.forEach(msg => {
    if (!msg.content) return;

    try {
      const parsed = JSON.parse(msg.content);

      if (parsed.fileTree) {
        Object.entries(parsed.fileTree).forEach(([filename, fileObj]) => {
          mergedFiles[filename] = {
            content: fileObj.file?.contents || fileObj.content || '',
          };
        });
      }
    } catch (err) {
      // If not a valid JSON (plain string message), ignore
    }
  });

  // Only update fileTree if there are new files
  if (Object.keys(mergedFiles).length > 0) {
    setFileTree(prev => ({ ...prev, ...mergedFiles }));
  }
}, [messagesList]);



const handleOpenFile = (filename) => {

  if (openFiles.includes(filename)) {
    setCurrentFile(filename);
    return;
  }


  setOpenFiles([...openFiles, filename]);
  setCurrentFile(filename);
};



    const handleCloseFile = (filenameToClose) => {
    const newOpenFiles = openFiles.filter((f) => f !== filenameToClose);

    if (currentFile === filenameToClose) {
      if (newOpenFiles.length > 0) {
        setCurrentFile(newOpenFiles[newOpenFiles.length - 1]);
      } else {
        setCurrentFile(null);
      }
    }
    setOpenFiles(newOpenFiles);
  };



  useEffect(() => {
    const socket = initializeSocket(projectId);

    recieveMessage('project-message', (data) => {
      // const message = JSON.parse(data.message)
      // console.log(message,"iska batan zara")
      // if(message.fileTree){
        // console.log(data);
      //   setFileTree(message.filetree)
      // }
      setMessages((prev) => [...prev, data]);

    });
    dispatch(fetchMessagesByProject(projectId)).then(() => {
      scrollToBottom()
    })
    return () => {
      disconnectSocket();
    };
  }, [projectId]
  );

  useEffect(() => {
    if (messagesList.length > 0)  dispatch(fetchMessagesByProject(projectId))

  }, [messagesList]);


  return (
    <div className="h-screen flex flex-col md:flex-row bg-[rgb(18,25,39)] text-white">
      <div className="h-screen flex flex-col md:flex-row bg-[rgb(24,32,46)] text-white ">

        <div className="w-full md:w-96 bg-[rgb(24,32,46)] p-4 flex flex-col border-b  border-teal-800/40">
          <div className='fixed md:relative top-0 md:pt-0 md:left-0 left-2 right-4 pt-4 bg-[rgb(24,32,46)]'><AddCollab projectId={projectId} /></div>
          <div className="flex-1 pb-7 md:pb-0 pt-16 md:pt-0 overflow-y-auto mb-4 space-y-2 scrollbar-hide ">
            {messagesList.length === 0 && (
              <p className="text-gray-500 text-sm">No messages yet.</p>
            )}

            {messagesList.map((msg, idx) => {
              const isSystemMessage = !msg.sender || msg.system === true;
              const isMe = !isSystemMessage && msg.sender._id === user.id;

              const senderName = isSystemMessage ? "AI Bot" : msg.sender.username;

return (
  <div key={idx} className="flex px-2 sm:px-4 py-1">
    <div className={`flex flex-col space-y-1 ${isMe ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
      <span className={`text-xs font-medium ${isMe ? 'text-white' : 'text-gray-400'}`}>
        {isMe ? 'You' : senderName}
      </span>

      <div
        className={`
          p-2 rounded-lg break-words 
          md:max-w-72
          max-w-[80vw] sm:max-w-[22rem] 
          overflow-x-auto whitespace-pre-wrap 
          ${isMe ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}
        `}
      >
        <div className="text-sm markdown-body">
          {isSystemMessage ? WriteAiMessage(msg.content) : msg.content}
        </div>

        <div className={`text-[10px] ${isMe ? 'text-white' : 'text-gray-400'} mt-1 text-right`}>
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </div>
      </div>
    </div>
  </div>
)

            })}




            <div ref={msgEndRef} />
          </div>



          <div className="flex  items-center gap-2  h-[50px] flex-shrink-0 bg-[rgb(24,32,46)] w-full fixed md:relative bottom-0 p-4 md:p-0 md:left-0  left-2 right-4 ">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-white/10 text-white border border-teal-700"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button className="bg-teal-600 hover:bg-teal-500" onClick={handleSendMessage}>
              <Send size={16} />
            </Button>
          </div>



        </div>
      </div>
<div className="hidden md:flex flex-1 h-full">


      <aside className="w-1/4 bg-gray-800 text-gray-100 p-4 overflow-y-auto hidden md:block">
        <h3 className="text-sm font-semibold mb-2">Explorer</h3>
        <ul className="space-y-1 text-xs">
          {Object.keys(fileTree).map((file, index) => (
            <li key={index} className="px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
              <button
                onClick={() => handleOpenFile(file)}
                className="w-full text-left"
              >
                {file}
              </button>
            </li>
          ))}
        </ul>
      </aside>

     


      <main className="flex-1 bg-gray-700 text-green-200 overflow-auto flex flex-col">
        {openFiles.length > 0 && (
          <div className="flex bg-gray-800 border-b border-gray-700">
            <div className='top w-full overflow-auto flex'>
              {openFiles.map((file, idx) => (
              <div
                key={idx}
                className={`
                  flex items-center space-x-1 px-3 py-1 
                  cursor-pointer 
                  ${currentFile === file ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700"}
                `}
              >
                <button onClick={() => setCurrentFile(file)} className="font-medium">
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
            
          </div>
        )}

 
        <div className="flex-1 overflow-y-auto">
          {currentFile ? fileTree[currentFile]?.content !== undefined &&(
            <textarea
              className="w-full h-full p-4 bg-slate-700  resize-none outline-none font-mono text-sm"
              value={fileTree[currentFile].content}
              onChange={(e) => {
                setFileTree({
                  ...fileTree,
                  [currentFile]: {
                    content: e.target.value
                  }
                });
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 italic">
              Select a file from the Explorer to view/edit
            </div>
          )}
        </div>
      </main>
</div>

    </div>
  );
};

export default Chatroom; 
