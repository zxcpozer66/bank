import { Route, Routes } from 'react-router-dom'
import Inflation from './Components/Inflation'
import KeyRate from './Components/KeyRate'
import LinksPaper from './Components/LinksPaper'
import TargetInflation from './Components/TargetInflation'

const NewPaperHome = () => {
	return (
		<Routes>
			<Route path='/' element={<LinksPaper />}>
				<Route index element={<TargetInflation />} />
				<Route path='inflation' element={<Inflation />} />
				<Route path='KeyRate' element={<KeyRate />} />
			</Route>
		</Routes>
	)
}

export default NewPaperHome
