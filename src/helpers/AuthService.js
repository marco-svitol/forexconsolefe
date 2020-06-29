import { API_URL } from '../config'
import Axios from 'axios'

export class AuthService {
	API_URL = API_URL

	init = () => {
		this.setInterceptors()
	}

	setInterceptors = () => {
		Axios.defaults.headers.common['Token'] = this.currentToken()
	}

	login = async (username, password) => {
		this.logout()

		if (!!username && !!password) {
			try {
				return await Axios.post(this.API_URL + 'front/login', {
					'username': username,
					'password': password
				})
					.then(resp => {
						if (resp.status !== 200) {
							throw Error()
						}
						const data = resp.data

						localStorage.setItem('token', data.token)
						localStorage.setItem('refreshtoken', data.refreshtoken)
						localStorage.setItem('user', username)
						sessionStorage.setItem('logged', true)

						return data.auth
					})
			} catch (ex) {
				return null
			}

		} else {
			return null
		}
	}

	logout = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('refreshtoken')
		localStorage.removeItem('user')
		sessionStorage.removeItem('logged')
	}

	authHeader = () => {
		const token = localStorage.getItem('token')

		if (token && token.length > 0) {
			return { Authorization: token }
			// return { 'x-access-token': user.accessToken }; // Thoery for Node.js Express
		}

		return {}
	}

	refreshToken = async (username) => {
		const refreshtoken = localStorage.getItem('refreshtoken')

		if (!!refreshtoken && refreshtoken.length > 0) {
			try {
				return Axios.post(this.API_URL + 'front/refreshtoken', {
					'username': username,
					'refreshtoken': refreshtoken
				})
					.then(resp => {
						if (resp.status !== 200) {
							throw Error()
						}

						const data = resp.data
						localStorage.setItem('token', data.token)

						return data
					})
			} catch (ex) {
				return new Error('Error during request to refresh')
			}
		} else {
			return new Error('No token found')
		}
	}

	isAuthenticated = () => sessionStorage.getItem('logged')
	currentToken = () => localStorage.getItem('token')
	currentRefreshToken = () => localStorage.getItem('refreshtoken')
}

Axios.interceptors.request.use(config => {
	const token = new AuthService().currentToken()

	config.headers['Content-Type'] = 'application/json'
	if (!!token) {
		config.headers['Authorization'] = token
	}

	return config
}, err => {
	return Promise.reject(err)
})

Axios.interceptors.response.use(response => {
	return response
}, err => {
	const originalRequest = err.config

	if (err.response.status === 401 && !originalRequest._retry) {
		if (!originalRequest.url.includes('login') && !originalRequest.url.includes('refreshtoken')) {
			originalRequest._retry = true
			return Axios.post(API_URL + 'front/refreshtoken', {
				'username': localStorage.getItem('user'),
				'refreshtoken': localStorage.getItem('refreshtoken')
			})
				.then(resp => {
					if (resp.status === 200) {
						const data = resp.data

						Axios.defaults.headers.common['Authorization'] = data.token
						localStorage.setItem('token', data.token)

						return Axios(originalRequest)
					}
				})
		}
	}
})

export default AuthService