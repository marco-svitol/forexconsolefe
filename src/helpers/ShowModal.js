import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'

export const ShowModal = ({
	title,
	text,
	show = false,
	showCallback,
	callbackFunction,
	type
}) => {
	const [_show, setShow] = useState(false)

	useEffect(() => {
		if (show) {
			setShow(true)
		} else {
			setShow(false)
		}
	}, [show])

	return (
		<Modal show={_show} onHide={() => {
			showCallback()
			setShow(false)
		}}>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{text}</Modal.Body>
			<Modal.Footer>
				<Button
					variant="secondary"
					onClick={() => {
						showCallback()
						setShow(false)
					}}>Torna indietro</Button>
				<Button
					variant="danger"
					onClick={() => {
						callbackFunction(type)
						showCallback()
						setShow(false)
					}}>Si, annulla!</Button>
			</Modal.Footer>
		</Modal>
	)
}

export default ShowModal