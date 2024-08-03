import axios from 'axios'
import { FC, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from './Components/Home'
import Login from './Components/Login.tsx/Login'
import Links from './MainRoutes/Links'
import PrivateRoute from './MainRoutes/PrivateRoute'
import Acc from './NewPaperHome/Components/Acc'
import CardAdd from './NewPaperHome/Components/CardAdd'
import Chat from './NewPaperHome/Components/Chat'
import Inflation from './NewPaperHome/Components/Inflation'
import KeyRate from './NewPaperHome/Components/KeyRate'
import Profile from './NewPaperHome/Components/Profile'
import TargetInflation from './NewPaperHome/Components/TargetInflation'

const HeaderHome: FC = () => {
	const [auth, setAuth] = useState(false)
	const [password, setPassword] = useState('')
	const [phone, setPhone] = useState('')
	const [userId, setUserId] = useState('')
	const [username, setUsername] = useState('')
	const [fullName, setFullName] = useState('Пользователь')
	const [role, setRole] = useState('')
	const [numberAcc, setNumberAcc] = useState<string>('')

	useEffect(() => {
		const storedAuth = localStorage.getItem('auth')
		if (storedAuth === 'true') {
			setAuth(true)
			const storedUserId = localStorage.getItem('userId')
			if (storedUserId) {
				setUserId(storedUserId)
			}
		}
	}, [])
	useEffect(() => {
		setNumberAcc(numberAcc)
	}, [numberAcc])
	useEffect(() => {
		if (userId) {
			const fetchUserData = async () => {
				try {
					const response = await axios.get('http://localhost:3001/api/users', {
						params: { id: userId },
					})
					setUsername(response.data.username)
					setPhone(response.data.phone || '')
					setFullName(response.data.fullName || '')
					setRole(response.data.role || '')
				} catch (error) {
					console.error('Ошибка при получении данных пользователя', error)
				}
			}
			fetchUserData()
		}
	}, [userId])

	return (
		<Routes>
			<Route path='/' element={<Links />}>
				<Route index element={<Home />} />
				<Route
					path='/acc'
					element={
						<PrivateRoute auth={auth}>
							<Acc
								setFullName={setFullName}
								fullName={fullName}
								auth={auth}
								setAuth={setAuth}
								username={username}
								phone={phone}
								userId={userId}
								setPhone={setPhone}
								setUsername={setUsername}
							/>
						</PrivateRoute>
					}
				/>
				<Route
					path='/register'
					element={<CardAdd numberAcc={numberAcc} />}
				></Route>
				<Route
					path='/cardadd'
					element={
						<PrivateRoute auth={auth}>
							<CardAdd numberAcc={numberAcc} />
						</PrivateRoute>
					}
				/>
				<Route
					path='/chat'
					element={<Chat fullName={fullName} role={role} />}
				/>

				<Route path='/inflation' element={<Inflation />} />
				<Route path='/KeyRate' element={<KeyRate />} />
				<Route path='/target' element={<TargetInflation />} />
				<Route path='/profile' element={<Profile userId={userId} />}></Route>
				<Route
					path='/login'
					element={
						<Login
							setPassword={setPassword}
							setPhone={setPhone}
							phone={phone}
							password={password}
							setAuth={setAuth}
						/>
					}
				/>
			</Route>
		</Routes>
	)
}

export default HeaderHome
