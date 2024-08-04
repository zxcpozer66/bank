import axios from 'axios'
import 'moment/locale/ru'
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import InvestForm from '../../Components/InvestForm'
import Bank from '../../Components/PrivateComponents/Bank'
import DataCard from '../../Components/PrivateComponents/DataCard'
import TransactionForm from '../../Components/TransactionForm'
import Invest from './Invest'
import Transact from './Transaction'

interface IProps {
	username: string
	phone: string
	auth: boolean
	setAuth: Dispatch<SetStateAction<boolean>>
	userId: string
	setPhone: Dispatch<SetStateAction<string>>
	setUsername: Dispatch<SetStateAction<string>>
	setFullName: Dispatch<SetStateAction<string>>
	fullName: string
}

const Acc: FC<IProps> = ({
	username,
	phone,
	auth,
	setAuth,
	setPhone,
	setUsername,
	fullName,
	setFullName,
	userId,
}) => {
	const navigate = useNavigate()
	const [user, setUser] = useState<any>(null)
	const [numberAcc, setNumberAcc] = useState<string | ''>('')
	const [loading, setLoading] = useState(false)
	const [showWelcome, setShowWelcome] = useState(true)
	const [transactions, setTransactions] = useState<any[]>([])
	const [deposits, setDeposits] = useState<any[]>([])
	const [showModal, setShowModal] = useState(false)
	const [showModal2, setShowModal2] = useState(false)
	const [balance, setBalance] = useState<number>(0)
	const [invest, setInvest] = useState<any[]>([])
	const [passport, setPassport] = useState<any[]>([])

	useEffect(() => {
		if (auth && userId) {
			const fetchData = async () => {
				try {
					const userResponse = await axios.get(
						'http://localhost:3001/api/users',
						{
							params: { id: userId },
						}
					)
					const user = userResponse.data
					setUser(user)
					setUsername(user.username || '')
					setPhone(user.phone || '')
					setFullName(user.fullName || '')

					const [
						transactionsResponse,
						cardResponse,
						depositsResponse,
						balanceResponse,
						passportResponse,
					] = await Promise.all([
						axios.get('http://localhost:3001/api/transactions', {
							params: { user_id: userId },
						}),
						axios.get('http://localhost:3001/api/cards', {
							params: { user_id: userId },
						}),
						axios.get('http://localhost:3001/api/deposits', {
							params: { user_id: userId },
						}),
						axios.get('http://localhost:3001/api/accounts', {
							params: { user_id: userId },
						}),
						axios.get('http://localhost:3001/api/passports', {
							params: { user_id: userId },
						}),
					])

					setBalance(balanceResponse.data.balance || 0)
					setTransactions(transactionsResponse.data || [])
					setNumberAcc(cardResponse.data.card_number || '')
					setDeposits(depositsResponse.data || [])
					setPassport(passportResponse.data || [])
				} catch (error) {
					console.error('Ошибка при получении данных:', error)
				}
			}
			fetchData()
		}
	}, [auth, userId, setUsername, setPhone, setFullName, setBalance])

	const handleDeposit = (amount: number) => {
		setBalance(prevBalance => prevBalance + amount)
	}

	const handleWithdraw = (amount: number) => {
		setBalance(prevBalance => prevBalance - amount)
	}

	useEffect(() => {
		if (fullName) {
			const timer = setTimeout(() => {
				setLoading(true)
				setShowWelcome(false)
			}, 2000)
			return () => clearTimeout(timer)
		}
	}, [fullName])

	const handleAddInvest = async () => {
		try {
			const response = await axios.get('http://localhost:3001/api/deposits', {
				params: { user_id: userId },
			})
			setInvest(response.data || [])
			const balanceResponse = await axios.get(
				'http://localhost:3001/api/accounts',
				{
					params: { user_id: userId },
				}
			)
			setBalance(balanceResponse.data.balance || 0)
		} catch (error) {
			console.log('Ошибка добавления вклада', error)
		}
	}

	const handleAddTransaction = async () => {
		try {
			const response = await axios.get(
				'http://localhost:3001/api/transactions',
				{
					params: { user_id: userId },
				}
			)
			setTransactions(response.data || [])
			const balanceResponse = await axios.get(
				'http://localhost:3001/api/accounts',
				{
					params: { user_id: userId },
				}
			)
			setBalance(balanceResponse.data.balance || 0)
		} catch (error) {
			console.error('Ошибка при обновлении транзакций:', error)
		}
	}

	const handleAddAccount = async (balance: number) => {
		try {
			await axios.post('http://localhost:3001/api/addAccount', {
				userId: userId,
				balance: balance,
			})
			alert('Счет успешно добавлен')

			const response = await axios.get('http://localhost:3001/api/accounts', {
				params: { user_id: userId },
			})
			setBalance(response.data.balance || 0)
		} catch (error) {
			console.error('Ошибка при добавлении счета:', error)
			alert('Ошибка при добавлении счета')
		}
	}

	const addForUser = async (balance: number) => {
		await handleCreateCard()
		await handleAddAccount(balance)
	}

	const handleCreateCard = async () => {
		try {
			await axios.post('http://localhost:3001/api/generateCard', { userId })
			alert('Карта успешно создана')

			const cardResponse = await axios.get('http://localhost:3001/api/cards', {
				params: { user_id: userId },
			})
			setNumberAcc(cardResponse.data.card_number || '')
		} catch (error) {
			console.error('Ошибка при создании карты:', error)
			alert('Ошибка при создании карты')
		}
	}

	const handleLogout = () => {
		localStorage.removeItem('auth')
		localStorage.removeItem('userId')
		setAuth(false)
		setUsername('')
		setPhone('')
		setFullName('')
		setBalance(0)
		navigate('/login')
	}

	return (
		<div className='container mx-auto p-4'>
			<div>
				<button
					onClick={handleLogout}
					className='p-2 shadow-slate-900 m-2 bg-[#080e41] text-white rounded-xl hover:bg-[#060b35]'
				>
					Выйти из аккаунта
				</button>
				<Link to='/profile'>
					<button className='p-2 shadow-slate-900 m-2 bg-[#080e41] text-white rounded-xl hover:bg-[#060b35]'>
						Настройки
					</button>
				</Link>
			</div>
			{showWelcome ? (
				<div className='flex items-center justify-center h-screen flex-col'>
					<div className='text-center -mt-[500px]'>
						<h2 className='text-4xl font-bold mb-4'>
							Добро пожаловать, {fullName ? fullName : 'Пользователь'}
						</h2>
						<p>Подключение к аккаунту...</p>
					</div>
				</div>
			) : (
				<div>
					<h2 className='text-center text-3xl font-bold mb-4'>Ваши данные</h2>
					<hr />
					<div className='flex flex-col gap-4 items-center'>
						{numberAcc ? (
							<div className=' flex p-4'>
								<DataCard user={user} fullName={fullName} phone={phone} />
								<Bank
									balance={balance}
									numberAcc={numberAcc}
									setNumberAcc={setNumberAcc}
									auth={auth}
									setAuth={setAuth}
									setBalance={setBalance}
								/>
							</div>
						) : (
							<div className='w-full max-w-md text-center'>
								<p>У вас отсутствует карта. Хотите оформить её онлайн?</p>
								<button
									onClick={async () => {
										try {
											await addForUser(balance)
										} catch (error) {
											console.error(
												'Ошибка при добавлении для пользователя:',
												error
											)
										}
									}}
									className='p-4 shadow-slate-900 m-2 bg-sky-800 text-white rounded-xl hover:bg-sky-700'
								>
									Добавить
								</button>
							</div>
						)}
					</div>

					<hr />

					{loading && numberAcc ? (
						<div className='flex justify-between mt-8 gap-4'>
							<div className='w-1/2'>
								<h2 className='text-center text-3xl font-bold mb-4'>Вклады</h2>
								<button
									className='p-2 shadow-slate-900 m-2 bg-[#080e41] text-white rounded-xl hover:bg-[#060b35]'
									onClick={() => {
										setShowModal2(true)
									}}
								>
									Вложить
								</button>
								{deposits.length > 0 ? (
									<Invest
										userId={userId}
										deposits={deposits}
										setDeposits={setDeposits}
										setBalance={setBalance}
									/>
								) : (
									<div className='text-center'>
										У вас нет вкладов. Хотите создать вклад?
									</div>
								)}
							</div>
							<div className='w-1/2'>
								<h2 className='text-center text-3xl font-bold mb-4'>
									Транзакции
								</h2>
								<button
									onClick={() => setShowModal(true)}
									className='p-2 shadow-slate-900 m-2 bg-[#080e41] text-white rounded-xl hover:bg-[#060b35]'
								>
									Перевести
								</button>
								{showModal && (
									<div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
										<div className='bg-white p-4 rounded-md shadow-md w-full max-w-md'>
											<TransactionForm
												userId={userId || ''}
												onAddTransaction={handleAddTransaction}
												onClose={() => setShowModal(false)}
												onDeposit={handleDeposit}
												onWithdraw={handleWithdraw}
											/>
										</div>
									</div>
								)}
								{showModal2 && (
									<div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
										<div className='bg-white p-4 rounded-md shadow-md w-full max-w-md'>
											<InvestForm
												userId={userId}
												handleAddInvest={handleAddInvest}
												onClose={() => {
													setShowModal2(false)
												}}
												onDeposit={handleDeposit}
												onWithdraw={handleWithdraw}
											/>
										</div>
									</div>
								)}
								{transactions.length > 0 ? (
									<Transact transactions={transactions} />
								) : (
									<div className='text-center'>У вас нет транзакций.</div>
								)}
							</div>
						</div>
					) : (
						<div className='text-center'>
							Для отображения данных требуется наличие карты/счета
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default Acc
