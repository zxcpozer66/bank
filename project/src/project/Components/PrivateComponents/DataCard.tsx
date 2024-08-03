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
		<div className='flex'>
			<div className='flex flex-col'>
				<img
					src={card}
					alt='Карта'
					className='h-64 w-96 object-cover rounded-md'
				/>
				<button
					className='p-2 m-2 bg-[#2e43ff] text-white rounded-xl hover:bg-[#44d3ff]'
					onClick={() => setShowForm(!showForm)}
				>
					{showForm ? <p>Скрыть</p> : <p>Данные владельца</p>}
				</button>
			</div>
			{showForm ? (
				<div className='m-9 flex gap-7'>
					<div>
						<div className='flex flex-col'>
							<p className='text-2xl text-gray-700'>Ваши данные:</p>
							<div className='flex flex-col border-2 p-5 rounded-lg shadow-lg'>
								<h3>Имя: {fullName}</h3>
								<h3>Номер: {phone}</h3>
								<h3>Адрес: {user.address}</h3>
								<h3>Почта: {user.email}</h3>
								<h3>
									Дата регистрации:{' '}
									{moment(user.date_registered).format('DD.MM.YYYY')}
								</h3>
							</div>
						</div>
					</div>
				</div>
			) : (
				<p className='p-4'>Вы скрыли данные</p>
			)}
		</div>
	)
}

export default DataCard
