import React, { FC } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface IProps {
	auth: boolean
	children: React.ReactNode
}

const PrivateRoute: FC<IProps> = ({ auth, children }) => {
	const location = useLocation()

	if (!auth) {
		return <Navigate to='/login' state={{ from: location }} />
	}

	return <>{children}</>
}

export default PrivateRoute
