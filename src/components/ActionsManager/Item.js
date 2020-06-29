import React, { useState, useEffect, useCallback } from 'react'
import { Dropdown, DropdownButton, InputGroup, FormControl, Button } from 'react-bootstrap'
import Axios from 'axios'
import { AuthService } from '../../helpers/AuthService'
import { API_URL, CurrencyMap } from '../../config'

import './item.css'

export const Item = ({ data, setModalCallback, setAlert, setItemsCallback, setMainCashCallback }) => {
	const authService = new AuthService()
	const currencyList = [
		"CHF",
		"€",
		"GBP",
		"$"
	]
	const [currency, setCurrency] = useState(currencyList[0])
	const [sentValue, setSentValue] = useState('')
	const [transfer, setTransfer] = useState('')
	const [sendingMoney, setSendingMoney] = useState(false)
	const [sendingTransfer, setSendingTransfer] = useState(false)
	const [actionIdMoney, setActionIdMoney] = useState({ actionid: 0 })
	const [actionIdTransfer, setActionIdTransfer] = useState({ actionid: 0 })
	const [lastTransactionDate, setLastTransactionDate] = useState(new Date())
	const [lastTransactionInfo, setLastTransactionInfo] = useState('')

	const { sendtopos, CHFtransfer, received } = data

	const textSendingMoney = sendingMoney ? 'Annulla' : 'Invia'
	const textSendingTransfer = sendingTransfer ? 'Annulla' : 'Invia'

	useEffect(() => {
		if (sendtopos.length > 0) {
			setActionIdMoney({actionid: sendtopos[0].actionid})
			setSentValue(sendtopos[0].amount)
			if (!!sendtopos[0].currency) {
				setCurrency(CurrencyMap[sendtopos[0].currency])
			}
			setSendingMoney(true)
		} else {
			setSendingMoney(false)
		}

		if (CHFtransfer.length > 0) {
			setActionIdTransfer({actionid: CHFtransfer[0].actionid})
			setTransfer(CHFtransfer[0].amount)
			setSendingTransfer(true)
		} else {
			setSendingTransfer(false)
		}

		const obj = received.map(d => ({date: new Date(d.timestamp), currency: d.currency, amount: d.amount}))
		let maxDate = new Date(Math.max.apply(null, obj.map(o => o.date)))
		
		setLastTransactionInfo(obj.filter(o => o.date.getTime() === maxDate.getTime()))
		setLastTransactionDate(new Date(maxDate).toLocaleString('it-IT'))
	}, [sendtopos, received, CHFtransfer])

	useEffect(() => {
		if (CHFtransfer.length > 0) {
			setActionIdTransfer({actionid: CHFtransfer[0].actionid})
			setTransfer(CHFtransfer[0].amount)
			setSendingTransfer(true)
		}
	}, [CHFtransfer])

	const fetchData = useCallback(async () => {
		await Axios.get(authService.API_URL + 'front/main')
			.then(resp => {
				if (resp.status === 200) {
					const data = resp.data
					if (data !== null) {
						setItemsCallback(data[0].pos)
						setMainCashCallback(data[0].maincash)
					}
				}
			})
			.catch(err => console.error(err))
	}, [authService.API_URL, setItemsCallback, setMainCashCallback])

	const sendMoney = async () => {
		// Request already sent, user wants to cancel operation
		if (sendingMoney) {
			setModalCallback({
				title: 'Annullare operazione',
				text: <>Sei sicuro di volere annullare l'operazione di <i>invio denaro</i> verso <b>{data.POSName}</b>?</>,
				show: true,
				callbackFunction: cancelOperation,
				type: 'money'
			})
		} else {
			if (sentValue === null || sentValue === undefined || sentValue === 0 || sentValue === '') return null

			setSendingMoney(true)

			try {
				const body = {
					'action': 'sendtopos',
					'POSId': data.POSId,
					'currency': CurrencyMap[currency],
					'amount': sentValue
				}
				await Axios.post(API_URL + 'front/action', body)
					.then(resp => {
						if (!!resp) {
							if (resp.status !== 201) {
								setAlert({ 
									title: 'Errore',
									text: <>Errore durante l'operazione di invio denaro verso {data.POSName}</>,
									show: true,
									type: 'danger'
								})
							} else {
								const d = resp.data
	
								if (d.actionid === 0) {
									setAlert({ 
										title: 'Errore',
										text: <>Errore durante l'operazione di invio denaro verso {data.POSName}</>,
										show: true,
										type: 'danger'
									})
									console.error('Errore, actionid = 0')
								} else {
									setActionIdMoney({ actionid: d.actionid })
									setAlert({ 
										title: 'Operazione aggiunta',
										text: <>L'operazione di invio <strong>{currency} {sentValue}</strong> è in attesa di conferma di ricezione dalla cassa di {data.POSName}.<br />È possibile annullare l'azione solo prima della conferma.</>,
										show: true,
										type: 'success'
									})

									fetchData()
								}
							}
						} else {
							setAlert({ 
								title: 'Errore',
								text: <>Errore durante l'operazione di invio denaro verso {data.POSName}.</>,
								show: true,
								type: 'danger'
							})
							console.error('Errore, sendMoney risposta da API undefined.')
						}
					})
			} catch (ex) {
				console.log('Errore', ex)
			}			
		}
	}

	const sendTransfer = async () => {
		// Request already sent, user wants to cancel operation
		if (sendingTransfer) {
			setModalCallback({
				title: 'Annullare operazione',
				text: <>Sei sicuro di volere annullare l'operazione di <i>accredito bonifico</i> verso <b>{data.POSName}</b>?</>,
				show: true,
				callbackFunction: cancelOperation,
				type: 'transfer'
			})
		} else {
			if (transfer === null || transfer === undefined || transfer === 0 || transfer === '') return null

			setSendingTransfer(true)

			try {
				const body = {
					'action': 'CHFtransfer',
					'POSId': data.POSId,
					'amount': transfer
				}
				await Axios.post(API_URL + 'front/action', body)
					.then(resp => {
						if (resp.status !== 201) {
							setAlert({ 
								title: 'Errore',
								text: <>Errore durante l'operazione di accredito bonifico verso {data.POSName}</>,
								show: true,
								type: 'danger'
							})
						} else {
							const d = resp.data

							if (d.actionid === 0) {
								setAlert({ 
									title: 'Errore',
									text: <>Errore durante l'operazione di accredito bonifico verso {data.POSName}</>,
									show: true,
									type: 'danger'
								})
								console.error('Errore, actionid = 0')
								return
							} else {
								setActionIdTransfer({ actionid: d.actionid })
								setAlert({ 
									title: 'Operazione aggiunta',
									text: <>L'operazione di accredito bonifico di <strong>{currency} {transfer}</strong> è in attesa di conferma dalla cassa di {data.POSName}.<br />È possibile annullare l'azione solo prima della conferma.</>,
									show: true,
									type: 'success'
								})
							}
						}
					})
			} catch (ex) {
				console.log('Errore', ex)
			}
		}
	}

	const cancelOperation = (type) => {
		let tempId = { actionid: 0 }

		setModalCallback({
			title: '',
			text: '',
			show: false,
			callbackFunction: null,
			type: null
		})

		if (type === 'money') {
			setSendingMoney(false)
			tempId = actionIdMoney
		}

		if (type === 'transfer') {
			tempId = actionIdTransfer
		}

		try {
			const body = { actionId: tempId.actionid }
			Axios.post(authService.API_URL + 'front/cancelAction', body)
			.then(resp => {
				if (!!resp) {
					// Bad response
					if (resp.status !== 200) {
						setAlert({ 
							title: 'Errore',
							text: <>Errore durante l'operazione di annullamento {type === 'money' ? 'invio denaro' : 'accredito'} verso {data.POSName}</>,
							show: true,
							type: 'danger'
						})
					} else {
						// Even if response is positive (200) check if
						// API returned 0, if so it's an error
						const d = resp.data
						if (d.actionid === 0) {
							setAlert({ 
								title: 'Errore',
								text: <>Errore durante l'operazione di annullamento {type === 'money' ? 'invio denaro' : 'accredito'} verso {data.POSName}</>,
								show: true,
								type: 'danger'
							})
							console.error('Errore, actionid = 0')
							return
						} else {
							// Everything went well, resetting tracking variables
							if (type === 'money') {
								setActionIdMoney({ actionid: 0 })
								setSentValue('')
								setSendingMoney(false)
							} else {
								setActionIdTransfer({ actionid: 0 })
								setTransfer('')
								setSendingTransfer(false)
							}
								
							setAlert({ 
								title: 'Operazione annullata',
								text: <>L'operazione di annullamento è andata a buon fine.</>,
								show: true,
								type: 'success'
							})
							
							fetchData()
						}
					}
				} else {
					setAlert({ 
						title: 'Errore',
						text: <>Errore durante l'operazione di annullamento {type === 'money' ? 'invio denaro' : 'accredito'} verso {data.POSName}</>,
						show: true,
						type: 'danger'
					})
					console.error('Errore, la risposta API è undefined')
				}
			})			
		} catch (ex) {
			console.log('Errore', ex)
		}
	}

	const toCurrency = (value, decimals = 2, decimalSeparator = '.', thousands = '\'', currency = undefined) => {
		try {
			decimals = isNaN(decimals) ? 2 : Math.abs(decimals)
		
			const negativeSign = value < 0 ? '-' : '';
		
			let i = parseInt(value = Math.abs(Number(value) || 0).toFixed(decimals)).toString();
			let j = (i.length > 3) ? i.length % 3 : 0;
		
			return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) + (decimals ? decimalSeparator + Math.abs(value - i).toFixed(decimals).slice(2) : '');
		  } catch (e) {
			console.log(e)
		  }
	}

	return (
			<tr>
				<td><b>{data.POSName}</b></td>
				<td>{toCurrency(data.CHF)}</td>
				<td>{toCurrency(data.EUR)}</td>
				<td>{toCurrency(data.GBP)}</td>
				<td>{toCurrency(data.USD)}</td>
				<td>{toCurrency(data.CHFPOS)}</td>
				<td>
					<>
						<InputGroup>
							<DropdownButton
								as={InputGroup.Prepend}
								variant="primary"
								title={currency}
								id="input-currency"
							>
								{currencyList.map(c => <Dropdown.Item key={c} onClick={() => setCurrency(c)}>{c}</Dropdown.Item>)}
							</DropdownButton>
							<FormControl
								value={sentValue}
								onChange={e => setSentValue(e.target.value)}
								disabled={sendingMoney}
								type='number'
								placeholder='Denaro'
								aria-label='Denaro'
							/>
						</InputGroup>
					</>
				</td>
				<td>
					<Button
						variant={sendingMoney ? "danger" : "primary"}
						onClick={() => sendMoney()}
					>{textSendingMoney}</Button>
				</td>
				<td>
					{toCurrency(lastTransactionInfo[0]?.amount)} {lastTransactionInfo[0]?.currency}, {lastTransactionDate.toLocaleString('it-IT', {
						hour: '2-digit',
						minute: '2-digit',
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					})}
				</td>
				<td>
					<>
						<InputGroup>
							<FormControl
								value={transfer}
								onChange={e => setTransfer(e.target.value)}
								disabled={sendingTransfer}
								type='number'
								placeholder='Denaro'
								aria-label='Denaro'
							/>
							<InputGroup.Append>
								<InputGroup.Text id="currency-addon">CHF</InputGroup.Text>
							</InputGroup.Append>
						</InputGroup>
					</>
				</td>
				<td>
					<Button
						variant={sendingTransfer ? "danger" : "primary"}
						onClick={() => sendTransfer()}
					>{textSendingTransfer}
					</Button></td>
			</tr>
	)
}

export default Item