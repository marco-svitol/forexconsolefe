import React, { useState, useEffect, useCallback } from 'react'
import { Table, Spinner, Button } from 'react-bootstrap'
import Axios from 'axios'
import AuthService from '../../helpers/AuthService'
import ShowModal from '../../helpers/ShowModal'
import ShowAlert from '../../helpers/ShowAlert'
import Item from './Item'
import Maincash from './MainCash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './actions.css'

export const ActionsManager = () => {
	const authService = new AuthService()
	const [loading, setLoading] = useState(true)
	const [items, setItems] = useState([])
	const [mainCash, setMainCash] = useState([])
	const [showMainCash, setShowMainCash] = useState(false)
	const [modal, setModal] = useState({ title: '', text: '', show: false, callbackFunction: null, type: null })
	const [alert, setAlert] = useState({ title: '', text: '', show: false, type: null })

	const fetchData = useCallback(async () => {
		await Axios.get(authService.API_URL + 'front/main')
			.then(resp => {
				if (resp.status === 200) {
					const data = resp.data
					if (data !== null) {
						setItems(data[0].pos)
						setMainCash(data[0].maincash)
					}
				}
			})
			.catch(err => console.error(err))
	}, [authService.API_URL])

	const handleModalShow = () => {
		setModal({ ...modal, show: false })
		// setModal({ title: '', text: '', show: false, calbackFunction: null, type: null })
	}

	const handleAlertShow = () => {
		setAlert({ ...alert, show: false })
	}

	// Startup login
	useEffect(() => {
		fetchData()
		setLoading(false)
	}, [fetchData])

	useEffect(() => {
		// Seconds before retrieving data from database again
		const updateRefreshTime = 20
		fetchData()
		const interval = setInterval(() => fetchData(), updateRefreshTime * 1000)

		return () => clearInterval(interval)
	}, [fetchData])

	return (
		loading ? <Spinner animation='border' variant='primary' style={{ position: 'absolute', top: '50%', left: '50%' }} /> :
			<>
				<ShowModal
					title={modal.title}
					text={modal.text}
					show={modal.show}
					showCallback={handleModalShow}
					callbackFunction={modal.callbackFunction}
					type={modal.type}
				/>

				<ShowAlert
					title={alert.title}
					text={alert.text}
					showAlert={alert.show}
					showCallback={handleAlertShow}
					type={alert.type}
				/>

				<h3 className="float-right">Action Manager</h3>
				<Table hover striped className='mt-4'>
					<thead>
						<tr>
							<th>Ufficio</th>
							<th className="currency-header">CHF</th>
							<th className="currency-header">€</th>
							<th className="currency-header">GBP</th>
							<th className="currency-header">$</th>
							<th>POS</th>
							<th>Invio denaro</th>
							<th className="fixed-size"></th>
							<th>Ultima ricezione denaro</th>
							<th>Accredito bonifico</th>
							<th className="fixed-size"></th>
						</tr>
					</thead>
					<tbody>
						{items.map(item =>
							<Item
								key={item.POSId}
								data={item}
								setModalCallback={setModal}
								setAlert={setAlert}
								setItemsCallback={setItems}
								setMainCashCallback={setMainCash}
							/>)}
					</tbody>
				</Table>

				<Maincash data={mainCash} setAlert={setAlert} showSection={showMainCash} />

				<Button
					id="main-cash-button"
					onClick={() => setShowMainCash(!showMainCash)}
					variant={'dark'}
				>
					<FontAwesomeIcon icon={['far', 'credit-card']} className="mr-1" /> Cassa Centrale
				</Button>
			</>
	)
}

export default ActionsManager