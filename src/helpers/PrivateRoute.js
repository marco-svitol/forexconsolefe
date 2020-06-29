import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import AuthService from './AuthService'

const PrivateRoute = ({ component: Component, ...rest }) => {
	const authService = new AuthService()

	return (
		<Route {...rest} render={props => (
			authService.isAuthenticated() === 'true' ?
				<Component {...props} />
				: <Redirect to="/login" />
		)} />
	);
};

export default PrivateRoute