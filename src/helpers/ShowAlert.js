import React, { useState, useEffect } from 'react'
import { Alert } from 'react-bootstrap'

export const ShowAlert = ({
	title,
	text,
	type,
	showAlert = false,
	showCallback
}) => {
	const [show, setShow] = useState(false)

	useEffect(() => showAlert ? setShow(true) : setShow(false), [showAlert])

	return (
		<Alert
			dismissible
			show={show}
			variant={type}
			style={{
				zIndex: 99999,
				position: 'absolute',
				bottom: 0,
				right: '1vw',
				cursor: 'pointer'
			}}
			onClose={() => {
				showCallback()
				setShow(false)
			}}
		>
			<Alert.Heading>{title}</Alert.Heading>
			<p>{text}</p>
		</Alert>
	)
}

export default ShowAlert