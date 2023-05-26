"use client"

import Image from 'next/image'
import useState from 'react-usestateref'
import userPic from '../public/user.png'
import botPic from '../public/gptBot.png'

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
        className='w-full py-2 px-3 text-gray-800 rounded-lg focus:outline-none'
        placeholder="Please feel free to ask"
        disabled={disabled} 
        onKeyDown={(ev) => handleKeyDown(ev)}
      />
      {disabled && (
        <svg>
          <path></path>
          <path></path>
        </svg>
      )}
      {!disabled && (
        <button
          onClick={() => sendInput()}
          className='p-2 rounded-md text-gray-500 bottom-1.5 right-1'
        >
          <svg>
            <path></path>
          </svg>
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

      <div className='mt-10 px-4'>
        {messages.map((msg: MessageProps) => (
          <ChatMessage key={msg.key} text={msg.text} from={msg.from}></ChatMessage>
        ))}
        {messages.length == 0 && <p className='text-center text-gray-400'>Waiting for your prompt...</p>}
      </div>
    </main>
  )
}
