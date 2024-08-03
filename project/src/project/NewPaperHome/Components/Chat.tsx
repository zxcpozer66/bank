import { FC, useEffect, useState } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:3001')

interface Message {
	user: string
	text: string
	role: string
}

interface IProps {
	fullName: string
	role: string
}

const Chat: FC<IProps> = ({ fullName, role }) => {
	const [message, setMessage] = useState<string>('')
	const [messages, setMessages] = useState<Message[]>([])
	const [error, setError] = useState<string>('')

	useEffect(() => {
		socket.on('connect', () => {
			console.log('Подключено к серверу')
			setError('')
		})

		socket.on('disconnect', () => {
			console.log('Отключено от сервера')
			setError('Отключено от сервера')
		})

		socket.on('chat message', (msg: Message) => {
			setMessages(prevMessages => [...prevMessages, msg])
		})

		socket.on('connect_error', err => {
			console.error('Ошибка подключения:', err.message)
			setError('Ошибка подключения к серверу')
		})

		return () => {
			socket.off('connect')
			socket.off('disconnect')
			socket.off('chat message')
			socket.off('connect_error')
		}
	}, [])

	const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (message.trim()) {
			socket.emit('chat message', {
				user: fullName,
				text: message,
				role: role,
			})
			setMessage('')
		}
	}

	return (
		<div className='flex flex-col min-h-[1050px] p-4 bg-gray-100'>
			<div className='flex-grow overflow-auto p-4 bg-white rounded-lg shadow-md mb-4'>
				<ul className='list-none p-0 m-0'>
					{messages.map((msg, index) => (
						<li
							key={index}
							className={`p-3 mb-2 rounded-lg shadow-sm ${
								msg.role === 'user'
									? 'bg-blue-500 text-white rounded-br-none ml-auto max-w-[30%] break-words rounded-md'
									: 'bg-gray-300 text-gray-800 rounded-bl-none mr-auto max-w-[30%] break-words'
							}`}
						>
							<span className='block font-bold'>
								{msg.user} ({msg.role})
							</span>
							<span className='block'>{msg.text}</span>
						</li>
					))}
				</ul>
			</div>
			{error && <div className='text-red-500 mb-4'>{error}</div>}
			<form onSubmit={sendMessage} className='flex items-center'>
				<input
					value={message}
					onChange={e => setMessage(e.target.value)}
					placeholder='Введите сообщение'
					className='flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
				<button
					type='submit'
					className='p-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
				>
					Отправить
				</button>
			</form>
		</div>
	)
}

export default Chat
