import React, { useState, useEffect } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import Header from './components/Header/Header'
import ActionsManager from './components/ActionsManager/ActionsManager'
import Login from './components/Auth/Login'
import PrivateRoute from './helpers/PrivateRoute'
import Dashboard from './components/Dashboard/Dashboard'

export const App = () => {
	const [authenticated, setAuthenticated] = useState(false)

	useEffect(() => {
		if (sessionStorage.getItem('logged')) {
			setAuthenticated(true)
		} else {
			setAuthenticated(false)
		}
	}, [authenticated])

	return (
		<Container fluid>
			<BrowserRouter basename='/'>
				<Header
					authenticated={authenticated}
					setAuthCallback={setAuthenticated}
				/>

				<Route
					exact
					path='/login'
					render={props => <Login {...props} authenticationCallback={setAuthenticated} />}
				/>

				<PrivateRoute
					exact
					path='/'
					component={Dashboard}
					loginPath='/login'
					isAuth={authenticated}
				/>

				<PrivateRoute
					exact
					path='/actions'
					component={ActionsManager}
					loginPath='/login'
					isAuth={authenticated}
				/>
			</BrowserRouter>
		</Container>
	)
}

export default App