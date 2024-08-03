// components/Modal.tsx
import React from 'react'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75'>
			<div className='bg-white rounded-lg shadow-lg max-w-md w-full'>
				<button
					onClick={onClose}
					className='absolute top-0 right-0 p-4 text-gray-500 hover:text-gray-700'
				>
					&times;
				</button>
				<div className='p-6'>{children}</div>
			</div>
		</div>
	)
}

export default Modal
