import moment from 'moment'
import { FC, useState } from 'react'
import card from '../../img/card.jpg'

interface User {
	address: string
	email: string
	date_registered: string
}

interface IProps {
	phone: string
	fullName: string
	user: User | null
}

export const DataCard: FC<IProps> = ({ phone, fullName, user }) => {
	const [showForm, setShowForm] = useState(false)

	if (!user) {
		return <p>Загрузка данных...</p>
	}

	return (
		<div className='flex flex-col items-center '>
			{showForm ? (
				<div className='m-2 p-5 border-2 rounded-lg shadow-lg'>
					<p className='text-2xl text-gray-700 mb-4'>Ваши данные:</p>
					<h3>Имя: {fullName}</h3>
					<h3>Номер: {phone}</h3>
					<h3>Адрес: {user.address}</h3>
					<h3>Почта: {user.email}</h3>
					<h3>
						Дата регистрации:{' '}
						{moment(user.date_registered).format('DD.MM.YYYY')}
					</h3>
				</div>
			) : (
				<img
					src={card}
					alt='Карта'
					className='h-64 w-96 object-cover rounded-md mb-4'
				/>
			)}
			<button
				className='p-2 m-2 bg-[#2e43ff] text-white rounded-xl hover:bg-[#44d3ff]'
				onClick={() => setShowForm(!showForm)}
			>
				{showForm ? <p>Скрыть</p> : <p>Данные владельца</p>}
			</button>
		</div>
	)
}

export default DataCard
