import { Link, Outlet } from 'react-router-dom'

const Links = () => {
	return (
		<div>
			<nav className='bg-gray-900 text-white flex items-center justify-between  p-2 '>
				<Link to='/' className='text-xl font-bold'>
					Главная
				</Link>
				<Link to='/chat' className='text-xl items-center p-2'>
					Тех. поддержка
				</Link>
				<div className='flex gap-1'>
					<Link to='/acc' className='text-xl items-center p-2'>
						Вход
					</Link>
					<p className='text-xl items-center p-2'> |</p>
					<Link to='/register' className='text-xl items-center p-2'>
						Регистрация
					</Link>
				</div>
			</nav>
			<Outlet />
		</div>
	)
}

export default Links
