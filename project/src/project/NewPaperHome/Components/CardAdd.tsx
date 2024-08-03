import axios from 'axios'
import { ChangeEvent, FC, FormEvent, useState } from 'react'

interface IProps {
	numberAcc: string
}

const CardAdd: FC<IProps> = ({}) => {
	const [numberAcc, serNumberAcc] = useState<string>('')
	const [formData, setFormData] = useState({
		phoneNumber: '',
		userName: '',
		password: '',
		confirmPassword: '',
		fullName: '',
	})

	const [error, setError] = useState<string | null>(null)

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value,
		})
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		if (formData.password !== formData.confirmPassword) {
			setError('Пароли не совпадают')
			return
		}

		if (!formData.phoneNumber || !formData.userName || !formData.fullName) {
			setError('Заполните все поля')
			return
		}

		try {
			const checkUserResponse = await axios.post(
				'http://localhost:3001/api/checkUser',
				{ userName: formData.userName }
			)

			if (checkUserResponse.data.message === 'Пользователь уже существует') {
				setError('Пользователь с таким именем уже существует')
				return
			}

			await axios.post('http://localhost:3001/api/register', {
				phone: formData.phoneNumber,
				username: formData.userName,
				password: formData.password,
				fullName: formData.fullName,
			})

			setError(null)
			alert('Регистрация успешна')
		} catch (error) {
			console.error('Ошибка при регистрации:', error)
			setError('Ошибка при регистрации')
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='bg-white p-8 rounded-lg shadow-xl w-full max-w-md'>
				<h2 className='text-2xl font-bold mb-6 text-center'>Регистрация</h2>
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block mb-1 font-medium text-gray-700'>
							Номер телефона:
						</label>
						<input
							onChange={handleChange}
							type='text'
							name='phoneNumber'
							placeholder='+79042002030'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200'
						/>
					</div>
					<div>
						<label className='block mb-1 font-medium text-gray-700'>
							Ваш логин:
						</label>
						<input
							onChange={handleChange}
							type='text'
							name='userName'
							placeholder='Введите логин'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200'
						/>
					</div>
					<div>
						<label className='block mb-1 font-medium text-gray-700'>
							Ваше имя:
						</label>
						<input
							type='text'
							onChange={handleChange}
							name='fullName'
							placeholder='Введите имя'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200'
						/>
					</div>
					<div>
						<label className='block mb-1 font-medium text-gray-700'>
							Пароль:
						</label>
						<input
							onChange={handleChange}
							type='password'
							name='password'
							placeholder='Введите пароль'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200'
						/>
					</div>
					<div>
						<label className='block mb-1 font-medium text-gray-700'>
							Подтверждение пароля:
						</label>
						<input
							onChange={handleChange}
							type='password'
							name='confirmPassword'
							placeholder='Подтвердите пароль'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200'
						/>
					</div>
					{error && <p className='text-red-500'>{error}</p>}
					<button
						type='submit'
						className='w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50'
					>
						Зарегистрировать
					</button>
				</form>
			</div>
		</div>
	)
}

export default CardAdd
