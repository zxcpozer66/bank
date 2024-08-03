import moment from 'moment'
import { FC } from 'react'

interface Transaction {
	transaction_id: number
	transaction_date: string
	amount: number
	from_account_id: string
	to_account_id: string
}

const Transact: FC<{ transactions: Transaction[] }> = ({ transactions }) => {
	if (transactions.length === 0) {
		return <p>Нет транзакций для отображения</p>
	}

	return (
		<div className='bg-white p-6 rounded-lg shadow-md border-2'>
			<ul>
				{transactions.map(transaction => (
					<li key={transaction.transaction_id} className='mb-4 border-2 p-4'>
						<p>
							<strong>Дата:</strong>{' '}
							{moment(transaction.transaction_date).format('DD.MM.YYYY')}
						</p>
						<p>
							<strong>Сумма:</strong> {transaction.amount}
						</p>
						<p>
							<strong>Отправитель:</strong> {transaction.from_account_id}
						</p>
						<p>
							<strong>Получатель:</strong> {transaction.to_account_id}
						</p>
					</li>
				))}
			</ul>
		</div>
	)
}

export default Transact
