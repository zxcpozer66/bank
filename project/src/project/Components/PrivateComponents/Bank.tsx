import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import tf from '../../img/tf.jpg'

interface IProps {
	numberAcc: string
	setNumberAcc: Dispatch<SetStateAction<string>>
	auth: boolean
	setAuth: Dispatch<SetStateAction<boolean>>
	balance: number
	setBalance: Dispatch<SetStateAction<number>>
}

export const Bank: FC<IProps> = ({ numberAcc, balance, setNumberAcc }) => {
	useEffect(() => {
		setNumberAcc(numberAcc)
	})
	const [showForm, setShowForm] = useState(false)

	return (
		<div className='flex'>
			<div className='flex flex-col'>
				<img
					src={tf}
					alt='Тинькоф фото'
					className='w-[200px] h-[200px] items-center'
				/>
				<button
					className='p-2  m-2 bg-[#2e43ff] text-white rounded-xl hover:bg-[#44d3ff]'
					onClick={() => {
						setShowForm(!showForm)
					}}
				>
					{showForm === false ? <p>Данные владельца</p> : <p>Скрыть</p>}
				</button>
			</div>
			{showForm === true ? (
				<div className='m-9 flex gap-7'>
					<div>
						<h2>Лицевой счет: </h2>
						<h2 className=' border-2 p-3 rounded-lg shadow-lg'>{numberAcc}</h2>
						<h2>Баланс счета:</h2>
						<h2 className=' border-2 p-3 rounded-lg shadow-lg'>{balance}</h2>
					</div>
				</div>
			) : (
				''
			)}
		</div>
	)
}

export default Bank
