import axios from 'axios'
import moment from 'moment'
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StyledInput from './StyledInput'
import AvatarUpload from './Upload'

interface IProps {
	userId: string
}

const Profile: FC<IProps> = ({ userId }) => {
	const [passportData, setPassportData] = useState<any | null>(null)
	const [passportNumber, setPassportNumber] = useState<string>('')
	const [issueDate, setIssueDate] = useState<string>('')
	const [expiryDate, setExpiryDate] = useState<string>('')
	const [country, setCountry] = useState<string>('')
	const [avatarUrl, setAvatarUrl] = useState<string>('')

	useEffect(() => {
		const fetchPassportData = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3001/api/passports',
					{
						params: { user_id: userId },
					}
				)
				const data = response.data

				if (data.passport_id) {
					setPassportData(data)
					setPassportNumber(data.passport_number || '')
					setIssueDate(
						data.issue_date ? moment(data.issue_date).format('YYYY-MM-DD') : ''
					)
					setExpiryDate(
						data.expiry_date
							? moment(data.expiry_date).format('YYYY-MM-DD')
							: ''
					)
					setCountry(data.country || '')
				} else {
					setPassportData(null)
					setPassportNumber('')
					setIssueDate('')
					setExpiryDate('')
					setCountry('')
				}

				const avatarResponse = await axios.get(
					'http://localhost:3001/api/avatars',
					{
						params: { user_id: userId },
					}
				)
				setAvatarUrl(avatarResponse.data.avatar_path || '')
			} catch (error) {
				console.log('Ошибка при получении данных паспорта', error)
			}
		}

		fetchPassportData()
	}, [userId])

	const handleUpdate = async () => {
		if (!passportNumber || !issueDate || !expiryDate || !country) {
			console.log('Все поля должны быть заполнены')
			return
		}

		if (!passportData || !passportData.passport_id) {
			console.log('Нет данных паспорта для обновления')
			return
		}

		try {
			const formattedIssueDate = moment(issueDate).format('YYYY-MM-DD')
			const formattedExpiryDate = moment(expiryDate).format('YYYY-MM-DD')

			const response = await axios.post(
				'http://localhost:3001/api/passports/update',
				{
					passport_id: passportData.passport_id,
					passport_number: passportNumber,
					issue_date: formattedIssueDate,
					expiry_date: formattedExpiryDate,
					country: country,
					user_id: userId,
				}
			)

			setPassportData({
				...passportData,
				passport_number: passportNumber,
				issue_date: formattedIssueDate,
				expiry_date: formattedExpiryDate,
				country: country,
			})

			console.log('Данные паспорта обновлены', response.data)
		} catch (error) {
			console.log('Ошибка при обновлении данных паспорта', error)
		}
	}

	const handleCreate = async () => {
		if (!passportNumber || !issueDate || !expiryDate || !country) {
			console.log('Все поля должны быть заполнены')
			return
		}

		try {
			const formattedIssueDate = moment(issueDate).format('YYYY-MM-DD')
			const formattedExpiryDate = moment(expiryDate).format('YYYY-MM-DD')

			const response = await axios.post(
				'http://localhost:3001/api/passports/create',
				{
					user_id: userId,
					passport_number: passportNumber,
					issue_date: formattedIssueDate,
					expiry_date: formattedExpiryDate,
					country: country,
				}
			)

			setPassportData({
				passport_id: response.data.passport_id,
				passport_number: passportNumber,
				issue_date: formattedIssueDate,
				expiry_date: formattedExpiryDate,
				country: country,
			})

			console.log('Новый паспорт создан', response.data)
		} catch (error) {
			console.log('Ошибка при создании нового паспорта', error)
		}
	}
	const navigator = useNavigate()
	const handleAvatar = async (file: File) => {
		const formData = new FormData()
		formData.append('avatar', file)
		formData.append('userId', userId)

		try {
			const response = await axios.post(
				'http://localhost:3001/api/avatars',
				formData,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				}
			)
			setAvatarUrl(response.data.avatarUrl || '')
			console.log('Аватарка загружена', response.data)
		} catch (error) {
			console.log('Ошибка при загрузке аватарки', error)
		}
	}

	return (
		<div className='container mx-auto p-4'>
			<div className='flex flex-col'>
				<div className='self-start'>
					<button
						className='p-2 shadow-slate-900 m-2 bg-[#080e41] text-white rounded-xl hover:bg-[#060b35]'
						onClick={() => {
							navigator(-1)
						}}
					>
						Вернуться
					</button>
				</div>

				<h2 className='text-center text-3xl font-bold mb-4 mt-4'>Профиль</h2>
			</div>

			<div className='flex flex-col gap-4 items-center'>
				<div className='space-y-4'>
					<AvatarUpload onUpload={handleAvatar} avatarUrl={avatarUrl} />
					<div>
						<p>Номер паспорта:</p>
						<StyledInput
							value={passportNumber}
							onChange={e => setPassportNumber(e.target.value)}
							placeholder='Номер паспорта'
						/>
					</div>
					<div>
						<p>Дата выдачи:</p>
						<StyledInput
							type='date'
							value={issueDate}
							onChange={e => setIssueDate(e.target.value)}
							placeholder='Дата выдачи'
						/>
					</div>
					<div>
						<p>Дата окончания срока:</p>
						<StyledInput
							type='date'
							value={expiryDate}
							onChange={e => setExpiryDate(e.target.value)}
							placeholder='Дата окончания срока'
						/>
					</div>
					<div>
						<p>Страна:</p>
						<StyledInput
							value={country}
							onChange={e => setCountry(e.target.value)}
							placeholder='Страна'
						/>
					</div>
				</div>
				{passportData && passportData.passport_id ? (
					<button
						onClick={handleUpdate}
						className='bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600'
					>
						Обновить данные
					</button>
				) : (
					<button
						onClick={handleCreate}
						className='bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600'
					>
						Создать паспорт
					</button>
				)}
			</div>
		</div>
	)
}

export default Profile
