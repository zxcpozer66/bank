import axios from 'axios'
import moment from 'moment'
import { FC, useEffect, useState } from 'react'
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
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)

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
				setPassportData(data)
				setPassportNumber(data.passport_number)
				setIssueDate(data.issue_date)
				setExpiryDate(data.expiry_date)
				setCountry(data.country)

				const avatarResponse = await axios.get(
					`http://localhost:3001/api/avatars`,
					{ params: { user_id: userId } }
				)
				setAvatarUrl(avatarResponse.data.avatar_path)
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

		try {
			const formattedIssueDate = moment(issueDate).format('YYYY-MM-DD')
			const formattedExpiryDate = moment(expiryDate).format('YYYY-MM-DD')

			const response = await axios.post('http://localhost:3001/api/passports', {
				passport_id: passportData.passport_id,
				passport_number: passportNumber,
				issue_date: formattedIssueDate,
				expiry_date: formattedExpiryDate,
				country: country,
			})

			setPassportData({
				...passportData,
				passport_number: passportNumber,
				issue_date: formattedIssueDate,
				expiry_date: formattedExpiryDate,
				country: country,
				avatar_path: avatarUrl,
			})

			console.log('Данные паспорта обновлены', response.data)
		} catch (error) {
			console.log('Ошибка при обновлении данных паспорта', error)
		}
	}

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
			setAvatarUrl(response.data.avatarUrl)
			console.log('Аватарка загружена', response.data)
		} catch (error) {
			console.log('Ошибка при загрузке аватарки', error)
		}
	}

	return (
		<div className='container mx-auto p-4'>
			<h2 className='text-center text-3xl font-bold mb-4'>Профиль</h2>
			<div className='flex flex-col gap-4 items-center'>
				{passportData ? (
					<div className='space-y-4'>
						<AvatarUpload onUpload={handleAvatar} avatarUrl={avatarUrl} />
						<div>
							<p>Номер паспорта:</p>
							<StyledInput
								value={passportNumber}
								onChange={e => setPassportNumber(e.target.value)}
								placeholder='Введите номер паспорта'
							/>
						</div>
						<div>
							<p>Дата выдачи:</p>
							<StyledInput
								type='date'
								value={moment(issueDate).format('YYYY-MM-DD')}
								onChange={e => setIssueDate(e.target.value)}
							/>
						</div>
						<div>
							<p>Дата истечения:</p>
							<StyledInput
								type='date'
								value={moment(expiryDate).format('YYYY-MM-DD')}
								onChange={e => setExpiryDate(e.target.value)}
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
						<button
							onClick={handleUpdate}
							className='bg-blue-500 text-white p-2 rounded'
						>
							Сохранить
						</button>
					</div>
				) : (
					<p>Загрузка данных паспорта...</p>
				)}
			</div>
		</div>
	)
}

export default Profile
