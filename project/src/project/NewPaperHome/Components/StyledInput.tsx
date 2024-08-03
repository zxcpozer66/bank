import React, { FC } from 'react'

interface StyledInputProps {
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	placeholder?: string
	type?: string
}

const StyledInput: FC<StyledInputProps> = ({
	value,
	onChange,
	placeholder = '',
	type = 'text',
}) => {
	return (
		<input
			type={type}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			className='border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
		/>
	)
}

export default StyledInput
