import axios from 'axios'
import { Dispatch, FC, FormEvent, SetStateAction, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface IProps {
	setPassword: Dispatch<SetStateAction<string>>
	setPhone: Dispatch<SetStateAction<string>>
	phone: string
	password: string
	setAuth: Dispatch<SetStateAction<boolean>>
}

const Login: FC<IProps> = ({
	setPassword,
	setPhone,
	phone,
	password,
	setAuth,
}) => {
	const navigate = useNavigate()
	useEffect(() => {
		const auth = localStorage.getItem('auth')
		if (auth === 'true') {
			navigate('/acc')
		}
	}, [navigate])

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		try {
			const response = await axios.post('http://localhost:3001/api/login', {
				username: phone,
				password: password,
			})

			if (response.status === 200) {
				const userId = response.data.message[0].id
				localStorage.setItem('userId', userId)
				localStorage.setItem('auth', 'true')
				setAuth(true)
				navigate('/acc')
				console.log('Успешный вход')
			} else {
				console.log('Ошибка аутентификации')
			}
		} catch (error) {
			console.error('Ошибка при входе:', error)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='bg-white p-8 rounded-lg shadow-xl w-full max-w-md'>
				<h2 className='text-2xl font-bold mb-6 text-center'>Вход</h2>
				<form className='space-y-6' onSubmit={handleSubmit}>
					<div>
						<label className='block mb-1 font-medium text-gray-700'>
							Номер телефона:
						</label>
						<input
							value={phone}
							onChange={e => setPhone(e.target.value)}
							type='text'
							placeholder='+79042002030'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200'
						/>
					</div>
					<div>
						<label className='block mb-1 font-medium text-gray-700'>
							Пароль:
						</label>
						<input
							value={password}
							onChange={e => setPassword(e.target.value)}
							type='password'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200'
						/>
					</div>
					<button
						type='submit'
						className='w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50'
					>
						Войти
					</button>
				</form>
			</div>
		</div>
	)
}

export default Login
