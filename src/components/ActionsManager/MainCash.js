import React, { useRef, useState } from 'react'
import Axios from 'axios'
import { Form, Button, Container, DropdownButton, InputGroup, Dropdown, FormControl, Row, Col, FormCheck } from 'react-bootstrap'
import { Doughnut } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import AuthService from '../../helpers/AuthService'
import { CurrencyMap } from '../../config'

export const MainCash = ({ data, setAlert, showSection }) => {
	const authService = new AuthService()
	const chartRef = useRef()
	const currencyList = [
		"CHF",
		"€",
		"GBP",
		"$"
	]
	const chartCurrencyMap = {
		'CHF': 'CHF',
		'EUR': '€',
		'GBP': 'GBP',
		'USD': '$'
	}
	const [currency, setCurrency] = useState(currencyList[0])
	const [showForm, setShowForm] = useState(false)
	const [amount, setAmount] = useState()
	const [exchangeRatio, setExchangeRatio] = useState()
	const [actionTodo, setActionTodo] = useState(true) // true - Deposit, false - Withdraw
	const chartData = {
		labels: data.map(c => c.currency),
		datasets: [{
			data: data.map(c => c.amount),
			backgroundColor: ['#881329', '#CB491E', '#ECB017', '#A0C030']
		}]
	}

	const handleChartClick = elem => {
		if (!!elem[0]) {
			let c = elem[0]._model.label
			setCurrency(chartCurrencyMap[c])
			setShowForm(true)
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		let body = {}

		// Deposito
		if (actionTodo) {
			body = {
				"currency": CurrencyMap[currency],
				"amount": amount,
				"exchangerate": exchangeRatio
			}
		} else {
			body = {
				"currency": CurrencyMap[currency],
				"amount": amount,
			}
		}

		try {
			await Axios.post(authService.API_URL + 'front/' + (actionTodo ? 'maincashdeposit' : 'maincashwithdraw'), body)
				.then(resp => {
					if (resp.status === 200) {
						const data = resp.data

						if (data.success) {
							setShowForm(false)
							setAlert({ title: 'Operazione riuscita', text: 'Operazione di integrazione cassa centrale riuscita correttamente.', show: true, type: 'success' })
							setAmount()
						} else {
							setAlert({ title: 'Errore', text: 'Errore durante l\'operazione di integrazione cassa centrale.', show: true, type: 'danger' })
						}
					}
				})
		} catch (ex) {
			console.error(ex)
			setAlert({ title: 'Errore', text: 'Errore durante l\'operazione di integrazione cassa centrale.', show: true, type: 'danger' })
		}
	}

	return (
		<div
			className="fixed-bottom"
			style={{
				textAlign: 'center',
				backgroundColor: '#fff',
				boxShadow: '0 0 15px rgba(0, 0, 0, .15)',
				transform: showSection ? 'translateY(0%)' : 'translateY(90%)',
				transition: '.4s transform ease-in-out'
			}}
		>
			<h3 className='mb-3'>Cassa centrale</h3>

			<Doughnut
				height={50}
				ref={chartRef}
				data={chartData}
				options={{
					onHover: (event, element) => event.target.style.cursor = !!element[0] ? 'pointer' : 'default',
					legend: {
						display: false
					},
					tooltips: {
						callbacks: {
							title: (tooltip, data) => data.labels[tooltip[0].index],
							label: (tooltip, data) => {
								const dataset = data.datasets[0]
								const percent = Math.round((dataset.data[tooltip.index] / dataset._meta[0].total) * 100)
								const currency = data.labels[tooltip.index]
								const formatter = Intl.NumberFormat('it-IT', {
									style: 'currency',
									currency: currency
								})
								return `${formatter.format(data.datasets[0].data[tooltip.index])} (${percent}%)`
							}
						},
						enabled: true,
						displayColors: false,
						backgroundColor: '#fff',
						borderColor: 'rgba(0, 0, 0, 0.2)',
						borderWidth: 1,
						titleFontSize: 26,
						titleFontColor: '#333',
						bodyFontSize: 26,
						bodyFontColor: '#333',
					},
					plugins: {
						datalabels: {
							color: '#fff',
							backgroundColor: '#333',
							borderRadius: '10',
							padding: '10',
							font: {
								family: 'Segoe UI',
								size: 20,
								weight: 300
							},
							formatter: (value, context) => {
								if (value > 999999) {
									return `${value / 1000000}M ${context.chart.data.labels[context.dataIndex]}`
								}

								if (value > 9999) {
									return `${value / 1000}K ${context.chart.data.labels[context.dataIndex]}`
								}

								return `${value} ${context.chart.data.labels[context.dataIndex]}`
							}
						}
					}
				}}
				onElementsClick={elem => handleChartClick(elem)}
			/>
			{showForm &&
				<Container className="mt-3 mb-3">
					<Form onSubmit={handleSubmit}>
						<Row>
							<Col>
								<Form.Label>Importo</Form.Label>
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
										autoFocus
										value={amount}
										onChange={e => setAmount(e.target.value)}
										type="number"
										placeholder="Importo"
										required
									/>
								</InputGroup>
							</Col>

							<Col>
								<Form.Label>Tasso di cambio</Form.Label>
								<Form.Control

									value={exchangeRatio}
									onChange={e => setExchangeRatio(e.target.value)}
									type="number"
									placeholder="Tasso di cambio"
									required={!actionTodo}
									disabled={!actionTodo}
								/>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col>
								<FormCheck
									inline
									type="radio"
									label='Deposito'
									checked={actionTodo}
									onChange={() => setActionTodo(true)}
								/>
								<FormCheck
									inline

									type="radio"
									label='Prelievo'
									checked={!actionTodo}
									onChange={() => setActionTodo(false)}
								/>
							</Col>
						</Row>

						<Row className="mt-4">
							<Col>
								<Button
									disabled={!!actionTodo ? !(amount?.length > 0 && exchangeRatio?.length > 0) : !amount?.length > 0}
									style={{ cursor: !!actionTodo ? (!(amount?.length > 0 && exchangeRatio?.length > 0) ? 'not-allowed' : 'pointer') : !amount?.length > 0 ? 'not-allowed' : 'pointer' }}
									type="submit">Invia</Button>
							</Col>
						</Row>
					</Form>
				</Container>
			}
		</div>
	)
}

export default MainCash