import './App.css'
import './normal.css';
import { FaRegPaperPlane } from 'react-icons/fa'
import { AiFillFileAdd } from 'react-icons/ai'
import { useState, useEffect } from 'react'

function App() {

  useEffect(() => {
    getEngines();
  }, [])

  const [input, setInput] = useState("");
  const [models, setModels] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [fileError, setFileError] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isSelected, setIsSelected] = useState(false);


  function clearChat(){
    setChatLog([])
  }

  function getEngines() {
    fetch("http://localhost:3080/models")
    .then(res => res.json())
    .then(data => {
      setModels(data.models)
    })
    .catch(error => console.error(error))
  }

  useEffect(() => {
    console.log(selectedText); // Log the state whenever it changes
  }, [selectedText]);

  const handleFileChange = (e) => {
    let selectedPDF = e.target.files[0]
    console.log(selectedPDF);       
    alert('File Uploaded');
    const formData = new FormData();
    formData.append("pdfFile", selectedPDF);
    fetch("http://localhost:3080/extract-text", {
      method: 'post',
      body: formData
    }).then(response => {
      return response.text()
    }).then(extractedText => {
      console.log(extractedText);
      setSelectedText(extractedText);
    })
  }

  async function handleSubmit (e) {
    e.preventDefault();
    let chatLogNew = [...chatLog, {user: "me", message: `${input}`}];
    let newMessage = [{user: 'me', message: `${input}`}]
    
    let newMessageSend = null;
    
    if (selectedText) {
      newMessageSend = newMessage[0].message.concat('\n', selectedText)
    } else {
      newMessageSend = newMessage[0].message
    }

    setInput('');
    const messages = chatLogNew.map((message) => message.message).join('\n')

    const response = await fetch("http://localhost:3080/", {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({
        message: newMessageSend
      })
    });
    const data = await response.json();
    setChatLog([...chatLogNew, {user: "server", message: `${data.message}`}])
  };

  return (
    <>
      <div className='App'>
      <aside className='sidemenu'>
        <div className='sidemenu-button' onClick={clearChat}> 
          <span>+</span>
          New Task
        </div>
        <div className='models'>
          <select className='model-select'>
            {models.map((model, index) => (
              <option key={index} value={model.id}>
                {model.id}
              </option>
            ))}
          </select>
        </div>
      </aside>
      <section className='chatbox'>
      <div className='chat-log'>
        {chatLog.map((message, index) => (
         <>
          <ChatMessage key={index} message={message} />
         </> 
        ))}
        </div>
        <div className='chat-input-holder'>
        <form onSubmit={handleSubmit} className='chat-form'>
          <input className='chat-input-text-area'
          rows='1'
          placeholder='Type your insurance query here...'
          value={input}
          onChange={(e) => setInput(e.target.value)}>
          </input>
          <label className='file-button'>
              <input type='file' className='input-upload' onChange={handleFileChange} accept='.pdf'/>
              <AiFillFileAdd />
          </label>
          <button type='submit' value="Submit" className='submit-button'>
            <FaRegPaperPlane />
          </button>
        </form>
        </div>
      </section>
      </div>
    </>
  )
}

const ChatMessage = ({message}) => {
  return (
    <div className={`chat-message ${message.user == 'server' && 'server'}`}>
    <div className='chat-message-center'>
      <div className={`avatar ${message.user == 'server' && 'server'}`}>
        {message.user == 'server' && <span />}
      </div>
      <div className='message'>
        {message.message}
        </div>
      </div>
    </div>
  )
} 

export default App


