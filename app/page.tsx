"use client"

import Image from 'next/image'
import useState from 'react-usestateref'
import userPic from '../public/user.png'
import botPic from '../public/gptBot.png'
import sendIcon from '../public/sendIcon.svg'

enum Creator {
  User = 0,
  Bot = 1,
}

interface MessageProps {
  text: string;
  from: Creator;
  key: number;
}

interface InputProps {
  onSend: (input: string) => void;
  disabled: boolean;
}

// single message component in the chat
const ChatMessage = ( { text, from }: MessageProps) => {
  return (
    <>
      {from == Creator.User && (
        <div className='bg-white p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap'>
          <Image src={userPic} alt="User" width={40} height={50}></Image>
          <p className='text-gray-700'>{text}</p>
        </div>
      )}
      {from == Creator.Bot && (
        <div className='bg-gray-100 p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap'>
          <Image src={botPic} alt='User' width={40}></Image>
          <p className='text-gray-700'>{text}</p>
        </div>
      )}
    </>
  )
}

//chat input filed
const ChatInput = ({ onSend, disabled }: InputProps ) => {
  const [input, setInput] = useState('');

  const sendInput = () => {
    onSend(input);
    setInput('');
  }

  const handleKeyDown = (event: any) => {
    if(event.keyCode === 13) {
      sendInput();
    }
  }

  return (
    <div className='bg-white border-2 p-2 rounded-lg flex justify-center'>
      <input 
        type="text"
        value={input}
        onChange={(event: any) => setInput(event.target.value)}
        className='w-full h-1 py-4 px-3 text-gray-800 rounded-lg focus:outline-none'
        placeholder="Please feel free to ask"
        disabled={disabled} 
        onKeyDown={(ev) => handleKeyDown(ev)}
      />
      {disabled && (
        <div className='h-4  ml-5'>
          <svg aria-hidden="true" className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        </div>
        
      )}
      {!disabled && (
        <button
          onClick={() => sendInput()}
          className='pl-4 pr-2 rounded-md text-gray-500 bottom-1.5 right-1'
        >
          {/* <img src="../public/sendIcon.svg" alt="" /> */}
          {/* <svg 
            xmlns="http://www.w3.org/2000/svg"
          > */}
            <Image src={sendIcon} alt='sendIcon' width={40}></Image>
          {/* </svg> */}
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const [messages, setMessages, messagesRef] = useState<MessageProps[]>([]);
  const [loading, setLoading]= useState(false);

  const callApi = async (input: string) => {
    setLoading(true);
    
    const myMessage: MessageProps = {
      text: input,
      from: Creator.User,
      key: new Date().getTime()
    };

    setMessages([...messagesRef.current, myMessage]);
    const response = await fetch('/api/generate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: input
      })
    }).then((res)=> res.json());
    setLoading(false);

    if(response.text){
      const botMessage: MessageProps = {
        text: response.text,
        from: Creator.Bot,
        key: new Date().getTime()
      };
      setMessages([...messagesRef.current, botMessage])
    }else{
      // show error
      console.log("Error getting response from OpenAI.")
    }
  };

  return (
    <main className="relative max-w-2xl mx-auto">
      <div className='sticky top-0 w-full pt-10 px-4'>
        <ChatInput onSend={(input) => callApi(input)} disabled={loading}></ChatInput>
      </div>

      <div className='text-center pt-5 mb-2 '>
        <button onClick={()=>{
          setMessages([]);
          setLoading(false)
          }} className='bg-slate-200 border border-slate-300 py-1 px-3 rounded'>
          Restart the conversation
        </button>
      </div>

      <div className='mt-10 px-4'>
        {messages.map((msg: MessageProps) => (
          <ChatMessage key={msg.key} text={msg.text} from={msg.from}></ChatMessage>
        ))}
        {messages.length == 0 && <p className='text-center text-gray-400'>Waiting for your prompt...</p>}
      </div>
    </main>
  )
}
