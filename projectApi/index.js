import cors from 'cors'
import express from 'express'
import http from 'http'
import multer from 'multer'
import mysql from 'mysql2'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname)
		const filename = Date.now() + ext
		cb(null, filename)
	},
})

const upload = multer({ storage: storage })

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST'],
	},
})

const PORT = process.env.PORT || 3001

const corsOptions = {
	origin: 'http://localhost:5173',
	methods: ['GET', 'POST'],
	allowedHeaders: ['Content-Type'],
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const connection = mysql.createConnection({
	host: '127.0.0.1',
	user: 'antonrub',
	password: 'antonrubcov2901@Q',
	database: 'bank',
	port: 3307,
})

connection.connect(err => {
	if (err) {
		console.error('Ошибка подключения к базе данных:', err.stack)
		return
	}
	console.log('Подключение к базе данных успешно')
})

const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(join(__dirname, '../project/dist')))

app.get('/chat', (req, res) => {
	res.sendFile(
		join(__dirname, '../project/src/project/NewPaperHome/Components/Chat.tsx')
	)
})

io.on('connection', socket => {
	console.log('New client connected')

	socket.on('chat message', msg => {
		console.log('Message received:', msg)
		io.emit('chat message', msg)
	})

	socket.on('disconnect', () => {
		console.log('Client disconnected')
	})
})

app.post('/api/avatars', upload.single('avatar'), (req, res) => {
	const file = req.file
	const { userId } = req.body
	if (!file) {
		return res.status(400).json({ error: 'Файл не загружен' })
	}
	const avatarUrl = `/uploads/${file.filename}`
	const checkQuery = 'SELECT * FROM avatars WHERE user_id = ?'
	connection.query(checkQuery, [userId], (err, results) => {
		if (err) {
			console.error('Ошибка при проверке записи:', err.stack)
			return res.status(500).json({ error: 'Ошибка при проверке записи' })
		}
		if (results.length > 0) {
			const updateQuery = 'UPDATE avatars SET avatar_path = ? WHERE user_id = ?'
			connection.query(updateQuery, [avatarUrl, userId], err => {
				if (err) {
					console.error('Ошибка при обновлении аватара:', err.stack)
					return res
						.status(500)
						.json({ error: 'Ошибка при обновлении аватара' })
				}
				res.status(200).json({ avatarUrl })
			})
		} else {
			const insertQuery =
				'INSERT INTO avatars (user_id, avatar_path) VALUES (?, ?)'
			connection.query(insertQuery, [userId, avatarUrl], err => {
				if (err) {
					console.error('Ошибка при вставке аватара:', err.stack)
					return res.status(500).json({ error: 'Ошибка при вставке аватара' })
				}
				res.status(201).json({ avatarUrl })
			})
		}
	})
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

server.listen(PORT, () => {
	console.log(`Сервер запущен на порту: ${PORT}`)
})
app.get('/api/avatars', (req, res) => {
	const { user_id } = req.query

	const query = 'SELECT avatar_path FROM avatars WHERE user_id = ?'
	connection.query(query, [user_id], (err, results) => {
		if (err) {
			return res.status(500).json({ message: 'Ошибка запроса аватарка' })
		}
		if (results.length > 0 && results[0].avatar_path) {
			const filePath = results[0].avatar_path
			return res.status(200).json({ avatar_path: filePath })
		} else {
			return res.status(200).json({ avatar_path: '' })
		}
	})
})

app.post('/api/withdraw', (req, res) => {
	const { user_id, deposit_id, deposit_amount } = req.body
	connection.beginTransaction(err => {
		if (err) {
			console.error('Ошибка начала транзакции:', err.stack)
			return res.status(500).json({ error: 'Ошибка начала транзакции' })
		}

		const checkDepositSql =
			'SELECT deposit_amount FROM deposits WHERE deposit_id = ? AND user_id = ?'
		connection.query(checkDepositSql, [deposit_id, user_id], (err, results) => {
			if (err) {
				return connection.rollback(() => {
					console.error('Ошибка проверки депозита:', err.stack)
					res.status(500).json({ error: 'Ошибка проверки депозита' })
				})
			}
			if (results.length === 0 || results[0].deposit_amount < deposit_amount) {
				return connection.rollback(() => {
					res.status(400).json({ error: 'Недостаточно средств на депозите' })
				})
			}

			const getUserBalanceSql = 'SELECT balance FROM accounts WHERE user_id = ?'
			connection.query(getUserBalanceSql, [user_id], (err, results) => {
				if (err) {
					return connection.rollback(() => {
						console.error('Ошибка получения баланса пользователя:', err.stack)
						res
							.status(500)
							.json({ error: 'Ошибка получения баланса пользователя' })
					})
				}
				if (results.length === 0) {
					return connection.rollback(() => {
						res.status(404).json({ error: 'Не найден аккаунт пользователя' })
					})
				}

				const newBalance = Number(results[0].balance) + Number(deposit_amount)
				const updateUserBalanceSql =
					'UPDATE accounts SET balance = ? WHERE user_id = ?'
				connection.query(updateUserBalanceSql, [newBalance, user_id], err => {
					if (err) {
						return connection.rollback(() => {
							console.error(
								'Ошибка обновления баланса пользователя:',
								err.stack
							)
							res
								.status(500)
								.json({ error: 'Ошибка обновления баланса пользователя' })
						})
					}

					const deleteDepositSql =
						'DELETE FROM deposits WHERE deposit_id = ? AND user_id = ?'
					connection.query(deleteDepositSql, [deposit_id, user_id], err => {
						if (err) {
							return connection.rollback(() => {
								console.error('Ошибка удаления депозита:', err.stack)
								res.status(500).json({ error: 'Ошибка удаления депозита' })
							})
						}

						connection.commit(err => {
							if (err) {
								return connection.rollback(() => {
									console.error('Ошибка фиксации транзакции:', err.stack)
									res.status(500).json({ error: 'Ошибка фиксации транзакции' })
								})
							}
							res.status(200).json({ message: 'Средства успешно выведены' })
						})
					})
				})
			})
		})
	})
})

app.post('/api/login', (req, res) => {
	const { username, password } = req.body
	const sql = 'SELECT * FROM users WHERE username = ? AND password = ?'
	connection.query(sql, [username, password], (err, results) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err.stack)
			return res.status(500).json({ error: 'Ошибка выполнения запроса входа' })
		}
		if (results.length > 0) {
			res.status(200).json({ message: results })
		} else {
			res.status(401).json({ error: 'Неверные учетные данные' })
		}
	})
})

app.get('/api/transactions', (req, res) => {
	const { user_id } = req.query
	if (!user_id) {
		return res.status(400).json({ error: 'user_id не найден' })
	}
	const sql = 'SELECT * FROM transactions WHERE user_id = ?'
	connection.query(sql, [user_id], (err, results) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err.stack)
			return res.status(500).json({ error: 'Ошибка выполнения запроса' })
		}
		res.status(200).json(results)
	})
})

app.get('/api/deposits', (req, res) => {
	const { user_id } = req.query
	const sql = 'SELECT * FROM deposits WHERE user_id = ?'
	connection.query(sql, [user_id], (err, results) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err.stack)
			return res.status(500).json({ error: 'Ошибка выполнения запроса' })
		}
		res.status(200).json(results)
	})
})

app.get('/api/cards', (req, res) => {
	const { user_id } = req.query
	const sql = 'SELECT * FROM cards WHERE user_id = ?'
	connection.query(sql, [user_id], (err, results) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err.stack)
			return res.status(500).json({ error: 'Ошибка выполнения запроса' })
		}
		if (results.length > 0) {
			const card = results[0]
			res.status(200).json({
				user_id: card.user_id,
				card_id: card.card_id,
				card_number: card.card_number,
				expiry_date: card.expiry_date,
				cvv: card.cvv,
				status: card.status,
				date_issued: card.date_issued,
			})
		} else {
			res.status(200).json([])
		}
	})
})

app.get('/api/users', (req, res) => {
	const { id } = req.query
	const sql = 'SELECT * FROM users WHERE id = ?'
	connection.query(sql, [id], (err, results) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err.stack)
			return res.status(500).json({ error: 'Ошибка выполнения запроса' })
		}
		if (results.length > 0) {
			const user = results[0]
			res.status(200).json({
				id: user.id,
				username: user.username,
				phone: user.phone,
				fullName: user.full_name,
				email: user.email,
				address: user.address,
				date_registered: user.date_registered,
				role: user.role,
			})
		} else {
			res.status(404).json({ error: 'Пользователь не найден' })
		}
	})
})
app.get('/users/:id', (req, res) => {
	const userId = req.params.id

	const query = 'SELECT * FROM users WHERE id = ?'
	connection.query(query, [userId], (error, results) => {
		if (error) {
			console.error('Ошибка выполнения запроса:', error)
			res.status(500).json({ message: 'Ошибка сервера' })
		} else if (results.length === 0) {
			res.status(404).json({ message: 'Пользователь не найден' })
		} else {
			const user = results[0]
			if (user.avatar) {
				user.avatar = `/uploads/${user.avatar}`
			}
			res.json(user)
		}
	})
})

app.get('/api/accounts', (req, res) => {
	const { user_id } = req.query
	const sql = 'SELECT * FROM accounts WHERE user_id = ?'
	connection.query(sql, [user_id], (err, results) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err.stack)
			return res.status(500).json({ error: 'Ошибка выполнения запроса' })
		}
		if (results.length > 0) {
			const accounts = results[0]
			res.status(200).json({
				account_id: accounts.account_id,
				user_id: accounts.user_id,
				account_number: accounts.account_number,
				balance: accounts.balance,
				date_opened: accounts.date_opened,
			})
		} else {
			res.status(200).json([])
		}
	})
})

app.post('/api/passports/create', (req, res) => {
	const { user_id, passport_number, issue_date, expiry_date, country } =
		req.body
	if (!user_id || !passport_number || !issue_date || !expiry_date || !country) {
		return res.status(400).json({ error: 'Не заполенены поля' })
	}
	const sql =
		'INSERT INTO passports (user_id, passport_number, issue_date, expiry_date, country) VALUES (?, ?, ?, ?, ?)'
	connection.query(
		sql,
		[user_id, passport_number, issue_date, expiry_date, country],
		(err, results) => {
			if (err) {
				console.error('Ошибка создания паспорта ', err.stack)
				return res.status(500).json({ message: 'Ошибка создания паспорта ' })
			}
			res.status(201).json({
				message: 'Паспорт создан успешно',
				passport_id: results.insertId,
			})
		}
	)
})

app.post('/api/passports/update', (req, res) => {
	const { passport_id, passport_number, issue_date, expiry_date, country } =
		req.body
	if (
		!passport_id ||
		!passport_number ||
		!issue_date ||
		!expiry_date ||
		!country
	) {
		return res.status(400).json({ error: 'Все поля должны быть заполнены' })
	}
	const sql =
		'UPDATE passports SET passport_number = ?, issue_date = ?, expiry_date = ?, country = ? WHERE passport_id = ?'
	connection.query(
		sql,
		[passport_number, issue_date, expiry_date, country, passport_id],
		(err, results) => {
			if (err) {
				console.error('Ошибка обновления паспорта', err.stack)
				return res.status(500).json({ error: 'Ошибка обновления паспорта' })
			}

			res.status(200).json({ message: 'Данные паспорта обновлены' })
		}
	)
})

app.get('/api/passports', (req, res) => {
	const { user_id } = req.query
	const sql = 'SELECT * FROM passports WHERE user_id = ?'
	connection.query(sql, [user_id], (err, results) => {
		if (err) {
			console.error('Ошибка запроса паспорт', err.stack)
			return res.status(500).json({ error: 'Ошибка запроса паспорт' })
		}
		if (results.length > 0) {
			const passport = results[0]
			res.status(200).json({
				user_id: passport.user_id,
				passport_id: passport.passport_id,
				passport_number: passport.passport_number,
				issue_date: passport.issue_date,
				expiry_date: passport.expiry_date,
				country: passport.country,
			})
		} else {
			res.status(200).json([])
		}
	})
})

app.post('/api/deposits', (req, res) => {
	const {
		date_created,
		deposit_id,
		user_id,
		deposit_amount,
		interest_rate,
		start_date,
		end_date,
	} = req.body

	connection.beginTransaction(err => {
		if (err) {
			console.error('Ошибка начала транзакции:', err.stack)
			return res
				.status(500)
				.json({ error: 'Ошибка начала транзакции', details: err.message })
		}

		// Проверяем, достаточно ли средств на счете пользователя
		const checkBalanceSql = 'SELECT balance FROM accounts WHERE user_id = ?'
		connection.query(checkBalanceSql, [user_id], (err, results) => {
			if (err) {
				return connection.rollback(() => {
					console.error('Ошибка проверки баланса:', err.stack)
					res
						.status(500)
						.json({ error: 'Ошибка проверки баланса', details: err.message })
				})
			}

			if (results.length === 0 || results[0].balance < deposit_amount) {
				return connection.rollback(() => {
					res.status(400).json({ error: 'Недостаточно средств на счете' })
				})
			}

			// Добавляем новый вклад
			const insertDepositSql =
				'INSERT INTO deposits (date_created, deposit_id, user_id, deposit_amount, interest_rate, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
			connection.query(
				insertDepositSql,
				[
					date_created,
					deposit_id, // предполагается, что вы генерируете этот ID на клиенте
					user_id,
					deposit_amount,
					interest_rate,
					start_date,
					end_date,
				],
				(err, results) => {
					if (err) {
						return connection.rollback(() => {
							console.error('Ошибка добавления депозита:', err.stack)
							res.status(500).json({
								error: 'Ошибка добавления депозита',
								details: err.message,
							})
						})
					}

					// Обновляем баланс пользователя
					const updateBalanceSql =
						'UPDATE accounts SET balance = balance - ? WHERE user_id = ?'
					connection.query(updateBalanceSql, [deposit_amount, user_id], err => {
						if (err) {
							return connection.rollback(() => {
								console.error('Ошибка обновления баланса:', err.stack)
								res.status(500).json({
									error: 'Ошибка обновления баланса',
									details: err.message,
								})
							})
						}

						connection.commit(err => {
							if (err) {
								return connection.rollback(() => {
									console.error('Ошибка фиксации транзакции:', err.stack)
									res.status(500).json({
										error: 'Ошибка фиксации транзакции',
										details: err.message,
									})
								})
							}
							res.status(201).json({
								message: 'Депозит успешно добавлен и баланс обновлен',
							})
						})
					})
				}
			)
		})
	})
})
app.post('/api/checkUser', (req, res) => {
	const { userName } = req.body
	const query = 'SELECT * FROM users WHERE username = ?'
	connection.query(query, [userName], (err, results) => {
		if (err) {
			console.error('Ошибка выполения запроса', err)
			res.status(500).json({ error: 'Ошибка запроса' })
			return
		}
		if (results.length > 0) {
			res.status(409).json({ message: 'Пользователь уже существует' })
		} else {
			res.status(200).json({ message: 'Пользователь не найден' })
		}
	})
})

app.post('/api/generateCard', (req, res) => {
	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min
	}
	function genCardNumber() {
		return Array.from({ length: 16 }, () => randomInt(0, 10)).join('')
	}
	function generateCVV() {
		return Array.from({ length: 3 }, () => randomInt(0, 10)).join('')
	}
	const { userId } = req.body
	if (!userId) {
		return res.status(400).json({ message: 'Отсутствует userId' })
	}
	const card_number = genCardNumber()
	const cvv = generateCVV()
	const status = 'active'
	const expiryDate = new Date()
	expiryDate.setFullYear(expiryDate.getFullYear() + 3)
	const sql =
		'INSERT INTO cards (user_id, card_number, cvv, status, expiry_date) VALUES (?, ?, ?, ?, ?)'
	connection.query(
		sql,
		[userId, card_number, cvv, status, expiryDate],
		(err, results) => {
			if (err) {
				console.error('Ошибка добавления карты:', err.stack)
				return res.status(500).json({ message: 'Ошибка запроса' })
			}
			res.status(201).json({ message: 'Карта добавлена' })
		}
	)
})
app.post('/api/addAccount', (req, res) => {
	const { userId, balance } = req.body
	function generateAccountNumber() {
		return Math.floor(1000000000 + Math.random() * 9000000000).toString()
	}
	const accountNumber = generateAccountNumber()
	if (!userId || !accountNumber || balance === undefined) {
		console.error('Ошибка: не все обязательные поля переданы', {
			userId,
			accountNumber,
			balance,
		})
		return res.status(400).json({ error: 'Ошибка нет пользователя/счета' })
	}
	const checkAccountSql = 'SELECT * FROM accounts WHERE account_number = ?'
	connection.query(checkAccountSql, [accountNumber], (err, results) => {
		if (err) {
			console.error('Ошибка проверки номера счета:', err.stack)
			return res.status(500).json({ error: 'Ошибка проверки номера счета' })
		}
		if (results.length > 0) {
			return res.status(409).json({ error: 'Номер счета уже существует' })
		}
		const sql =
			'INSERT INTO accounts (user_id, account_number, balance) VALUES (?, ?, ?)'
		connection.query(sql, [userId, accountNumber, balance], (err, results) => {
			if (err) {
				console.error('Ошибка добавления счета:', err.stack)
				return res.status(500).json({ error: 'Ошибка при добавлении счета' })
			}
			res.status(201).json({ message: 'Счет добавлен' })
		})
	})
})

app.post('/api/register', (req, res) => {
	const { phone, username, password, fullName } = req.body
	const user_role_id = 1
	if (!phone || !username || !password || !fullName) {
		return res.status(400).json({ error: 'Все поля должны быть заполнены' })
	}
	const checkUserQuery = 'SELECT * FROM users WHERE username = ?'
	connection.query(checkUserQuery, [username], (err, results) => {
		if (err) {
			console.error('Ошибка выполнения запроса:', err.stack)
			return res.status(500).json({ error: 'Ошибка выполнения запроса' })
		}
		if (results.length > 0) {
			return res.status(409).json({ message: 'Пользователь уже существует' })
		}
		const sql =
			'INSERT INTO users (phone, username, password, full_name,user_role_id) VALUES (?, ?, ?, ?, ?)'
		connection.query(
			sql,
			[phone, username, password, fullName, user_role_id],
			err => {
				if (err) {
					console.error('Ошибка добавления пользователя:', err.stack)
					return res
						.status(500)
						.json({ error: 'Ошибка добавления пользователя' })
				}
				res.status(201).json({ message: 'Регистрация успешна' })
			}
		)
	})
})

app.post('/api/addTransaction', (req, res) => {
	const { transaction_date, amount, to_phone, to_card, user_id } = req.body

	connection.beginTransaction(err => {
		if (err) {
			console.error('Ошибка начала транзакции:', err.stack)
			return res.status(500).json({ error: 'Ошибка начала транзакции' })
		}

		const getFromAccountIdSql =
			'SELECT account_id FROM accounts WHERE user_id = ?'
		connection.query(getFromAccountIdSql, [user_id], (err, results) => {
			if (err) {
				return connection.rollback(() => {
					console.error('Ошибка получения account_id отправителя:', err.stack)
					res
						.status(500)
						.json({ error: 'Ошибка получения account_id отправителя' })
				})
			}
			if (results.length === 0) {
				return connection.rollback(() => {
					res.status(400).json({ error: 'Отправитель не найден' })
				})
			}
			const from_account_id = results[0].account_id

			const getToAccountIdSql = to_phone
				? 'SELECT accounts.account_id FROM accounts JOIN users ON accounts.user_id = users.id WHERE users.phone = ?'
				: 'SELECT accounts.account_id FROM accounts JOIN cards ON accounts.user_id = cards.user_id WHERE cards.card_number = ? AND cards.status = "active"'

			const toParam = to_phone ? to_phone : to_card
			connection.query(getToAccountIdSql, [toParam], (err, results) => {
				if (err) {
					return connection.rollback(() => {
						console.error('Ошибка получения account_id получателя:', err.stack)
						res
							.status(500)
							.json({ error: 'Ошибка получения account_id получателя' })
					})
				}
				if (results.length === 0) {
					return connection.rollback(() => {
						res.status(400).json({
							error: to_phone
								? 'Номер телефона получателя не найден'
								: 'Номер карты получателя не найден',
						})
					})
				}
				const to_account_id = results[0].account_id

				const checkBalanceSql =
					'SELECT balance FROM accounts WHERE account_id = ?'
				connection.query(checkBalanceSql, [from_account_id], (err, results) => {
					if (err) {
						return connection.rollback(() => {
							console.error('Ошибка проверки баланса:', err.stack)
							res.status(500).json({ error: 'Ошибка проверки баланса' })
						})
					}
					if (results.length === 0 || results[0].balance < amount) {
						return connection.rollback(() => {
							res
								.status(400)
								.json({ error: 'Недостаточно средств на счету отправителя' })
						})
					}

					const insertTransactionSql = `
			  INSERT INTO transactions 
			  (transaction_date, amount, from_account_id, to_account_id, user_id) 
			  VALUES (?, ?, ?, ?, ?)`
					connection.query(
						insertTransactionSql,
						[transaction_date, amount, from_account_id, to_account_id, user_id],
						(err, results) => {
							if (err) {
								return connection.rollback(() => {
									console.error('Ошибка добавления транзакции:', err.stack)
									res
										.status(500)
										.json({ error: 'Ошибка добавления транзакции' })
								})
							}

							const updateFromAccountSql =
								'UPDATE accounts SET balance = balance - ? WHERE account_id = ?'
							connection.query(
								updateFromAccountSql,
								[amount, from_account_id],
								err => {
									if (err) {
										return connection.rollback(() => {
											console.error(
												'Ошибка обновления баланса отправителя:',
												err.stack
											)
											res.status(500).json({
												error: 'Ошибка обновления баланса отправителя',
											})
										})
									}
									const updateToAccountSql =
										'UPDATE accounts SET balance = balance + ? WHERE account_id = ?'
									connection.query(
										updateToAccountSql,
										[amount, to_account_id],
										err => {
											if (err) {
												return connection.rollback(() => {
													console.error(
														'Ошибка обновления баланса получателя:',
														err.stack
													)
													res.status(500).json({
														error: 'Ошибка обновления баланса получателя',
													})
												})
											}

											connection.commit(err => {
												if (err) {
													return connection.rollback(() => {
														console.error(
															'Ошибка фиксации транзакции:',
															err.stack
														)
														res
															.status(500)
															.json({ error: 'Ошибка фиксации транзакции' })
													})
												}

												res.status(201).json({
													message: 'Транзакция добавлена и балансы обновлены',
													transaction_id: results.insertId,
												})
											})
										}
									)
								}
							)
						}
					)
				})
			})
		})
	})
})
