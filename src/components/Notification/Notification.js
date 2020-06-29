import React, { useState, useEffect, useCallback } from 'react'
import { Button } from 'react-bootstrap'
import Axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AuthService from '../../helpers/AuthService'

import './notification.css'

export const NotificationDropdown = () => {
	const authService = new AuthService()
	const [notifications, setNotifications] = useState([])
	const [showNotificationBox, setShowNotificationBox] = useState(false)

	const fetchNotifications = useCallback(async () => {
		await Axios.get(authService.API_URL + 'front/alerts')
			.then(resp => {
				if (resp.status === 200) {
					const data = resp.data
					if (data !== null) {
						setNotifications(data)
					}
				}
			})
			.catch(err => console.error(err))
	}, [authService.API_URL])

	useEffect(() => {
		fetchNotifications()
	}, [fetchNotifications])

	useEffect(() => {
		// Seconds before retrieving data from database again
		const updateRefreshTime = 10
		fetchNotifications()
		const interval = setInterval(() => fetchNotifications(), updateRefreshTime * 1000)

		return () => clearInterval(interval)
	}, [fetchNotifications])

	return (
		<div id="notification-box-wrapper">
			<Button
				variant='light'
				onClick={() => setShowNotificationBox(!showNotificationBox)}
			>
				<FontAwesomeIcon
					icon={[notifications?.length > 0 ? 'fas' : 'far', 'bell']}
				/>
			</Button>
			<div
				id="notification-box"
				style={{
					opacity: showNotificationBox ? 1 : 0,
					position: 'absolute',
					right: 0,
					zIndex: showNotificationBox ? 999999 : -999999
				}}
			>
				<h2>Notifiche</h2>
				{notifications.length > 0 ?
					<ul>
						{notifications.map((n, i) =>
							<NotificationItem
								key={i + n.POSName + n.alertmsg}
								data={n}
								hasBottomLine={(i + 1) !== notifications.length}
							/>
						)}
					</ul>
					:
					<div className="d-flex justify-content-center no-notification">
						<h3 style={{ color: '#999' }}>Nessuna notifica</h3>
					</div>
				}
			</div>
		</div>
	)
}

export const NotificationItem = ({ data, hasBottomLine }) => {
	const authService = new AuthService()
	const [userAck, setUserAck] = useState(false)

	const handleAck = () => {
		if (!userAck) {
			Axios.post(authService.API_URL + 'front/alertack', {
				alertId: data.alertId
			})
				.then(resp => {
					if (resp.status === 200) {
						const data = resp.data
						if (data.message === 'ok') {
							setUserAck(true)
						} else {
							// Mostrare errore?
						}
					}
				})
		}
	}

	const dateFormatter = (date) => {
		if (!date) {
			return null
		}

		return new Date(date).toLocaleDateString('it-IT', {
			day: 'numeric',
			month: 'numeric'
		})
	}

	const hourFormatter = (date) => {
		if (!date) {
			return null
		}

		return new Date(date).toLocaleTimeString('it-IT', {
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const getSeverity = (severity) => {
		if (!severity) {
			return 'high'
		}

		if (severity === '1') {
			return 'low'
		}

		if (severity === '2') {
			return 'medium'
		}

		if (severity === '3') {
			return 'high'
		}

		if (severity === '4') {
			return 'critical'
		}
	}

	useEffect(() => {
		if (!!data.acknowledged) {
			setUserAck(true)
		}
	}, [data.acknowledged])

	return (
		<>
			<li>
				<div className="d-flex item">
					<div className="time-group d-flex flex-column">
						<span className="date">{dateFormatter(data.timestamp)}</span>
						<span className="time">{hourFormatter(data.timestamp)}</span>
						<span className="button">
							<Button
								variant={userAck ? 'success' : 'primary'}
								onClick={handleAck}
							>Letto</Button>
						</span>
					</div>
					<div className="d-flex flex-column type">
						<div className={getSeverity(data.severity)}></div>
						<div className="right-line"></div>
					</div>
					<div>
						<h3 className="title">{data.POSName}</h3>
						<p>{data.alertmsg}</p>
					</div>
				</div>
			</li>
			{hasBottomLine && <hr />}
		</>
	)
}

export default { NotificationDropdown }