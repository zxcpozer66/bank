import { FC, useRef } from 'react'

interface AvatarUploadProps {
	onUpload: (file: File) => void
	avatarUrl?: string
}

const AvatarUpload: FC<AvatarUploadProps> = ({ onUpload, avatarUrl }) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const handleClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click()
		}
	}

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			onUpload(file)
		}
	}

	return (
		<div className='flex flex-col items-center'>
			<div className='cursor-pointer' onClick={handleClick}>
				{avatarUrl ? (
					<img
						src={`http://localhost:3001${avatarUrl}`}
						alt='Avatar'
						className='w-24 h-24 rounded-full object-cover'
					/>
				) : (
					<div className='w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center'>
						<span>Загрузить</span>
					</div>
				)}
			</div>
			<input
				type='file'
				accept='image/*'
				ref={fileInputRef}
				style={{ display: 'none' }}
				onChange={handleFileChange}
			/>
		</div>
	)
}

export default AvatarUpload
