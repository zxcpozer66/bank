import { NavLink, Outlet } from 'react-router-dom'

const LinksPaper = () => {
	return (
		<div>
			<nav className='bg-slate-500 items-center text-white p-4 w-[500px] '>
				<NavLink to='/target' className='px-2'>
					Цель по инфляции
				</NavLink>
				<NavLink to='/inflation' className='px-2'>
					Инфляция
				</NavLink>
				<NavLink to='/KeyRate' className='px-2'>
					Ключевая ставка
				</NavLink>
			</nav>
			<Outlet />
		</div>
	)
}

export default LinksPaper
