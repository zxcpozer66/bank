import axios from 'axios'
import moment from 'moment'
import { Dispatch, FC, SetStateAction, useEffect } from 'react'

interface Deposits {
	deposit_id: string
	user_id: string
	deposit_amount: number
	interest_rate: number
	start_date: string
	end_date: string
	status: string
	date_created: string
}

interface InvestProps {
	deposits: Deposits[]
	setDeposits: Dispatch<SetStateAction<Deposits[]>>
	setBalance: Dispatch<SetStateAction<number>>
	userId: string | null
	fetchDeposits: () => void
}

const Invest: FC<InvestProps> = ({
	deposits,
	setDeposits,
	setBalance,
	userId,
}) => {
	const handleWithdraw = async (deposit_id: string, deposit_amount: number) => {
		try {
			const updatedDeposits = deposits.filter(
				deposit => deposit.deposit_id !== deposit_id
			)
			setDeposits(updatedDeposits)
			setBalance(prevBalance => Number(prevBalance) + Number(deposit_amount))

			if (userId) {
				await axios.post('http://localhost:3001/api/withdraw', {
					user_id: userId,
					deposit_id,
					deposit_amount,
				})
			} else {
				console.error('Ошибка: userId не определен')
			}
		} catch (error) {
			console.log('Ошибка при выводе средств с вклада', error)
		}
	}

	if (deposits.length === 0) {
		return <p>У вас отсутствуют вклады</p>
	}
	useEffect(() => {})
	return (
		<div className='bg-white p-6 rounded-lg shadow-md border-2'>
			<ul>
				{deposits.map(deposit => {
					const interestAmount =
						(deposit.deposit_amount * deposit.interest_rate) / 100
					const total_amount =
						Number(deposit.deposit_amount) + Number(interestAmount)

					return (
						<li key={deposit.deposit_id} className='mb-4 border-2 p-4'>
							<p>
								<strong>Сумма депозита:</strong> {deposit.deposit_amount} ₽
							</p>
							<p>
								<strong>Итого сумма:</strong> {total_amount} ₽
							</p>
							<p>
								<strong>Дата начала:</strong>{' '}
								{new Date(deposit.start_date).toLocaleDateString()}
							</p>
							<p>
								<strong>Дата окончания:</strong>{' '}
								{new Date(deposit.end_date).toLocaleDateString()}
							</p>
							<p>
								<strong>Процентная ставка:</strong> {deposit.interest_rate}%
							</p>
							<p>
								<strong>Дата создания:</strong>{' '}
								{moment(new Date()).format('DD.MM.YYYY')}
							</p>
							<button
								className='p-2 shadow-slate-900 m-2 bg-[#080e41] text-white rounded-xl hover:bg-[#060b35]'
								onClick={() =>
									handleWithdraw(deposit.deposit_id, deposit.deposit_amount)
								}
							>
								Вывести
							</button>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export default Invest
