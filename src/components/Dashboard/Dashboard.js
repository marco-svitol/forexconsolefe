import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Row, Button, ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import { Line, Bar } from 'react-chartjs-2'
import Axios from 'axios'
import AuthService from '../../helpers/AuthService'

export const Dashboard = () => {
	const authService = new AuthService()
	const currencyMap = {
		1: 'CHF',
		2: 'EUR',
		3: 'USD',
		25: 'GBP',
		30: 'POS'
	}
	const [timespan, setTimespan] = useState('week')
	const [pos, setPos] = useState([])
	const [selectedPos, setSelectedPos] = useState({
		POSId: '',
		POSName: ''
	})
	const [chartData, setChartData] = useState([])
	const [barChartData, setBarChartData] = useState([])
	const chartRef = useRef()
	const barChartRef = useRef()

	const handleTimestamp = (t) => {
		setTimespan(t)
		localStorage.setItem('dashboard-timespan', t)
		fetchData()
	}

	const handlePOSSelection = (pos) => {
		setSelectedPos(pos)
		localStorage.setItem('dashboard-POSId', pos.POSId)
		localStorage.setItem('dashboard-POSName', pos.POSName)
	}

	const colors = [
		['rgba(255, 175, 25, .8)', 'rgba(255, 0, 128, .8)'],
		['rgba(54, 209, 220, .8)', 'rgba(91, 134, 229, .8)'],
		['rgba(86, 171, 47, 0.8)', 'rgba(168, 224, 99, .8)'],
		['rgba(2, 170, 176, .8)', 'rgba(0, 205, 172, .8)'],
		['rgba(253, 187, 45, .8)', 'rgba(34, 193, 195, .8)'],
	]

	const setGradient = (ctx, index) => {
		const { height } = ctx.canvas
		let c = colors[index]
		let g = ctx.createLinearGradient(0, 0, 0, height)
		g.addColorStop(0, c[0])
		g.addColorStop(1, c[1])

		return g
	}

	const data = canvas => {
		const ctx = canvas.getContext('2d')
		const gradient = setGradient(ctx, 0)
		const gradient2 = setGradient(ctx, 1)
		const gradient3 = setGradient(ctx, 2)
		const gradient25 = setGradient(ctx, 3)
		const gradient30 = setGradient(ctx, 4)

		return {
			labels: chartData.map(d => {
				const date = new Date(d.timestep).toLocaleString('it-IT', {
					weekday: 'short',
					day: 'numeric',
					month: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})

				return date
			}),
			datasets: [
				{
					label: currencyMap[1],
					data: chartData.map(d => d['1']),
					borderColor: '#fff',
					borderWidth: 3,
					backgroundColor: gradient,
					pointRadius: 1,
					pointHoverRadius: 2,
					pointBackgroundColor: '#fff',
					pointHoverBackgroundColor: '#fff',
				},
				{
					label: currencyMap[2],
					data: chartData.map(d => d['2']),
					borderColor: '#fff',
					borderWidth: 3,
					backgroundColor: gradient2,
					pointRadius: 1,
					pointHoverRadius: 2,
					pointBackgroundColor: '#fff',
					pointHoverBackgroundColor: '#fff',
				},
				{
					label: currencyMap[3],
					data: chartData.map(d => d['3']),
					borderColor: '#fff',
					borderWidth: 3,
					backgroundColor: gradient3,
					pointRadius: 1,
					pointHoverRadius: 2,
					pointBackgroundColor: '#fff',
					pointHoverBackgroundColor: '#fff',
				},
				{
					label: currencyMap[25],
					data: chartData.map(d => d['25']),
					borderColor: '#fff',
					borderWidth: 3,
					backgroundColor: gradient25,
					pointRadius: 1,
					pointHoverRadius: 2,
					pointBackgroundColor: '#fff',
					pointHoverBackgroundColor: '#fff',
				},
				{
					label: currencyMap[30],
					data: chartData.map(d => d['30']),
					borderColor: '#fff',
					borderWidth: 3,
					backgroundColor: gradient30,
					pointRadius: 1,
					pointHoverRadius: 2,
					pointBackgroundColor: '#fff',
					pointHoverBackgroundColor: '#fff',
				},
			]
		}
	}

	const barData = {
		labels: barChartData[0]?.pos.map(d => d.POSName),
		datasets: [
			{
				label: 'CHF',
				backgroundColor: 'rgba(255, 191, 72, .8)',
				borderColor: 'rgb(255, 191, 72)',
				borderWidth: 1,
				data: barChartData[0]?.pos.map(p => p.CHF)
			},
			{
				label: 'EUR',
				backgroundColor: 'rgba(94, 218, 227, .8)',
				borderColor: 'rgb(94, 218, 227)',
				borderWidth: 1,
				data: barChartData[0]?.pos.map(p => p.EUR)
			},
			{
				label: 'USD',
				backgroundColor: 'rgba(120, 188, 88, .8)',
				borderColor: 'rgb(120, 188, 88)',
				borderWidth: 1,
				data: barChartData[0]?.pos.map(p => p.USD)
			},
			{
				label: 'GBP',
				backgroundColor: 'rgba(240, 94, 35, .8)',
				borderColor: 'rgb(240, 94, 35)',
				borderWidth: 1,
				data: barChartData[0]?.pos.map(p => p.GBP)
			},
			{
				label: 'POS',
				backgroundColor: 'rgba(252, 88, 250, .8)',
				borderColor: 'rgb(252, 88, 250)',
				borderWidth: 1,
				data: barChartData[0]?.pos.map(p => p.CHFPOS)
			}
		]
	}

	// SQL date formatter
	const sqlDateFormatter = (date) => `${new Date(date).toISOString().slice(0, 10)} ${new Date(date).toLocaleTimeString('it-IT')}`

	const getPOS = useCallback(async () => {
		await Axios.get(authService.API_URL + 'front/pos')
			.then(resp => {
				if (resp.status === 200) {
					setPos(resp.data)


					if (selectedPos.POSId === '') {
						setSelectedPos(resp.data[0])

						// Check if in localStorage there is a POS already selected
						const POSId = localStorage.getItem('dashboard-POSId')
						const POSName = localStorage.getItem('dashboard-POSName')

						if (POSId !== null && POSId !== undefined) {
							setSelectedPos({
								POSId: POSId,
								POSName: POSName
							})
						}
					}
				}
			})
			.catch(err => console.error(err))
	}, [authService.API_URL, selectedPos])

	const fetchData = useCallback(async () => {
		// milliseconds * seconds * minutes * hours -> 24 hours ago
		let spanTime = 1000 * 60 * 60 * 24

		if (timespan === 'week') {
			spanTime *= 7
		}

		if (timespan === 'month') {
			spanTime *= 30
		}

		if (!!selectedPos.POSId) {
			await Axios.post(authService.API_URL + 'front/posbalancetrend', {
				"POSIds": [selectedPos.POSId],
				"currencies": [1, 2, 3, 25, 30],
				"from": sqlDateFormatter(Date.now() - spanTime),
				"to": sqlDateFormatter(Date.now())
			})
				.then(resp => {
					if (resp.status === 200) {
						const data = resp.data
						if (data !== null) {
							setChartData(data)
						}
					}
				})
				.catch(err => console.error(err))
		}

		await Axios.get(authService.API_URL + 'front/main')
			.then(resp => {
				if (resp.status === 200) {
					const data = resp.data
					if (data !== null) {
						setBarChartData(data)
					}
				}
			})
			.catch(err => console.error(err))
	}, [authService.API_URL, timespan, selectedPos])

	// Startup
	useEffect(() => {
		const ts = localStorage.getItem('dashboard-timespan')
		setTimespan(ts)
		getPOS()
		fetchData()
	}, [getPOS, fetchData])

	useEffect(() => {
		// Seconds before retrieving data from database again
		const updateRefreshTime = 20
		fetchData()
		const interval = setInterval(() => fetchData(), updateRefreshTime * 1000)

		return () => clearInterval(interval)
	}, [fetchData])

	return (
		<>
			<h3 className="float-right">Dashboard</h3>
			<div style={{ clear: "both" }}></div>
			<Row className="mb-3 justify-content-center">
				<ButtonGroup aria-label="chart-days" className="mr-3">
					<Button onClick={() => handleTimestamp('day')} active={timespan === 'day'}>Ultimo giorno</Button>
					<Button onClick={() => handleTimestamp('week')} active={timespan === 'week'}>Ultima settimana</Button>
					<Button onClick={() => handleTimestamp('month')} active={timespan === 'month'}>Ultimo mese</Button>
				</ButtonGroup>

				<Dropdown>
					<DropdownButton id="pos" title={selectedPos.POSName}>
						{pos.map(p => <Dropdown.Item key={p.POSId} onClick={() => handlePOSSelection(p)}>{p.POSName}</Dropdown.Item>)}
					</DropdownButton>
				</Dropdown>
			</Row>

			<div
				style={{
					height: '16vw',
				}}
			>
				<Line
					ref={chartRef}
					data={data}
					options={{
						maintainAspectRatio: false,
						scales: {
							xAxes: [{
								gridLines: {
									display: true,
									drawBorder: false,
									z: 1,
									borderDash: [10, 6],
									color: '#fff',
									drawOnChartArea: true,
									zeroLineColor: 'transparent'
								},
								ticks: {
									fontColor: '#555',
									fontSize: 16
								}
							}],
							yAxes: [{
								ticks: { display: true },
								gridLines: {
									display: false,
									drawBorder: false
								}
							}]
						},
						legend: {
							display: true,
							// onClick: (e, item) => item.text // Recupero il testo della legenda..
						},
						tooltips: {
							enabled: false,
						},
						plugins: {
							datalabels: {
								display: ctx => ctx.dataIndex === 0 ? true : false || ctx.dataIndex === ctx.dataset.data.length - 2 || ctx.active,
								color: '#fff',
								font: {
									family: 'Segoe UI',
									size: 14,
									weight: 500
								},
								clip: false,
								clamp: true,
								backgroundColor: 'rgba(80, 80, 80, .8)',
								borderRadius: 50,
								align: 'end',
								anchor: 'end',
								padding: {
									left: 10,
									right: 10
								},
								formatter: (value, ctx) => `${value} ${ctx.dataset.label}`
							}
						}
					}
					}
				/>
			</div>

			<div
				className="mt-5"
				style={{
					height: '16vw',
				}}
			>
				<Bar
					ref={barChartRef}
					data={barData}
					options={{
						maintainAspectRatio: false,
						tooltips: {
							enabled: true,
							backgroundColor: 'rgba(80, 80, 80, .8)',
							borderRadius: 50,
							bodyFontFamily: 'Segoe UI',
							bodyFontColor: '#fff'
						},
						plugins: {
							datalabels: {
								display: false,
							}
						}
					}}
				/>
			</div>
		</>)
}

export default Dashboard