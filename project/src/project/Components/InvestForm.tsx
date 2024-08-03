import axios from 'axios'
import { FC, useState } from 'react'

interface IProps {
	userId: string
	handleAddInvest: () => void
	onClose: () => void
	onDeposit: (amount: number) => void
	onWithdraw: (amount: number) => void
}

const InvestForm: FC<IProps> = ({
	userId,
	onClose,
	handleAddInvest,
	onDeposit,
	onWithdraw,
}) => {
	const [amount, setAmount] = useState<number>(0)
	const [rate, setRate] = useState<number>(4.5)
	const [startDate, setStartDate] = useState<string>('')
	const [endDate, setEndDate] = useState<string>('')

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		try {
			await axios.post('http://localhost:3001/api/deposits', {
				user_id: userId,
				deposit_amount: amount,
				interest_rate: rate,
				start_date: startDate,
				end_date: endDate,
			})
			handleAddInvest()
			onClose()
			onDeposit(amount)
		} catch (error) {
			console.log('Ошибка при добавлении вклада', error)
		}
	}

	return (
		<div className='invest-form p-4 border-2 rounded-md shadow-md'>
			<h3 className='text-xl font-bold mb-4'>Добавить вклад</h3>
			<form onSubmit={handleSubmit}>
				<div className='mb-4'>
					<label className='block mb-1'>Сумма вклада</label>
					<input
						type='number'
						value={amount}
						onChange={e => setAmount(Number(e.target.value))}
						className='block w-full p-2 border rounded'
						required
					/>
				</div>
				<div className='mb-4'>
					<label className='block mb-1'>Процентная ставка</label>
					<input
						type='number'
						step='0.1'
						value={rate}
						onChange={e => setRate(Number(e.target.value))}
						className='block w-full p-2 border rounded'
						required
					/>
				</div>
				<div className='mb-4'>
					<label className='block mb-1'>Дата начала</label>
					<input
						type='date'
						value={startDate}
						onChange={e => setStartDate(e.target.value)}
						className='block w-full p-2 border rounded'
						required
					/>
				</div>
				<div className='mb-4'>
					<label className='block mb-1'>Дата окончания</label>
					<input
						type='date'
						value={endDate}
						onChange={e => setEndDate(e.target.value)}
						className='block w-full p-2 border rounded'
						required
					/>
				</div>
				<div className='flex justify-end space-x-4'>
					<button
						type='button'
						onClick={onClose}
						className='p-2 bg-gray-500 text-white rounded hover:bg-gray-600'
					>
						Отмена
					</button>
					<button
						type='submit'
						className='p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
					>
						Вложить
					</button>
				</div>
			</form>
		</div>
	)
}

export default InvestForm
