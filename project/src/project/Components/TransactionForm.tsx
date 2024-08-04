import axios from 'axios'
import { FC, useEffect, useState } from 'react'

interface IProps {
	userId: string
	onAddTransaction: () => void
	onClose: () => void
	onDeposit: (amount: number) => void
	onWithdraw: (amount: number) => void
}

const TransactionForm: FC<IProps> = ({ userId, onAddTransaction, onClose }) => {
	const [transactionDate, setTransactionDate] = useState<string>('')
	const [amount, setAmount] = useState<number>(0)
	const [toPhone, setToPhone] = useState<string>('') // Номер телефона получателя

	useEffect(() => {
		const today = new Date().toISOString().split('T')[0]
		setTransactionDate(today)
	}, [])

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		try {
			await axios.post('http://localhost:3001/api/addTransaction', {
				transaction_date: transactionDate,
				amount: Number(amount),
				to_phone: toPhone, // Номер телефона получателя
				user_id: userId,
			})
			onAddTransaction()
			onClose()
			setTransactionDate('')
			setAmount(0)
			setToPhone('')
		} catch (error) {
			console.error('Ошибка при добавлении транзакции', error)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='p-6 border rounded-lg shadow-md bg-white'
		>
			<h3 className='text-2xl font-semibold mb-4'>Добавить транзакцию</h3>

			<label className='block mb-2'>
				<span className='text-gray-700'>Сумма:</span>
				<input
					type='number'
					value={amount}
					onChange={e => setAmount(Number(e.target.value))}
					className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
					required
				/>
			</label>

			<label className='block mb-4'>
				<span className='text-gray-700'>Кому (номер телефона):</span>
				<input
					type='text'
					value={toPhone}
					onChange={e => setToPhone(e.target.value)}
					className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
					required
				/>
			</label>

			<div className='flex justify-end space-x-4'>
				<button
					type='button'
					onClick={onClose}
					className='py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
				>
					Отмена
				</button>
				<button
					type='submit'
					className='py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
				>
					Перевести
				</button>
			</div>
		</form>
	)
}

export default TransactionForm
