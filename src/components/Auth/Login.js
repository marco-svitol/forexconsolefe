import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { Container, FormGroup, Form, Button, Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AuthService from '../../helpers/AuthService'

export const Login = ({ authenticationCallback }) => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [logged, setLogged] = useState(false)
	const [error, setError] = useState('')

	const authService = new AuthService()

	const loginError = <Alert className="mt-4" variant='danger'><FontAwesomeIcon icon={['fas', 'exclamation-triangle']} className="mr-3" />{error}</Alert>

	const handleSubmit = e => {
		e.preventDefault()

		authService
			.login(username, password)
			.then(resp => {
				if (!!resp) {
					setError('')
					authenticationCallback(resp)
					setLogged(true)
				} else {
					setError('Verificare nome utente e/o password.')
				}
			})
	}

	return (
		<>
			{logged && <Redirect to='/' />}
			<Container>
				<Form onSubmit={handleSubmit}>
					<FormGroup controlId='loginUsername'>
						<Form.Label>Username</Form.Label>
						<Form.Control
							autoFocus
							value={username}
							onChange={e => setUsername(e.target.value)}
							type="text"
							placeholder="Username"
							required
						/>
					</FormGroup>

					<FormGroup controlId='loginPassword'>
						<Form.Label>Password</Form.Label>
						<Form.Control
							value={password}
							onChange={e => setPassword(e.target.value)}
							type="password"
							placeholder="Password"
							required
						/>
						<Form.Text className='text-muted'>
							Non condividere mai le credenziali con nessuno.
				</Form.Text>
					</FormGroup>

					<Button
						disabled={!(username.length > 0 && password.length > 0)}
						style={{ cursor: !(username.length > 0 && password.length > 0) ? 'not-allowed' : 'pointer' }}
						type="submit">Login</Button>
				</Form>
				{error && loginError}
			</Container>
		</>
	)
}

export default Login