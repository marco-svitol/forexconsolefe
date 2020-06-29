import React from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar, Nav, Dropdown, DropdownButton, Image, Button } from 'react-bootstrap'
import { NotificationDropdown } from '../Notification/Notification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AuthService from '../../helpers/AuthService'

import './header.css'

export const Header = ({ authenticated, setAuthCallback }) => {
	const authService = new AuthService()
	const activePage = useLocation().pathname

	const logout = () => {
		authService.logout()
		setAuthCallback(false)
	}

	return (
		<>
			<Navbar>
				<Navbar.Brand href="/">
					<img
						src="/logo.png"
						width="200"
						className="d-inline-block align-top"
						alt="Forex Console"
					/>
				</Navbar.Brand>
				{authenticated &&
					<Navbar.Collapse className="justify-content-end align-items-end">
						<NotificationDropdown />
						<DropdownButton
							alignRight
							variant='light'
							id='profile-pic'
							title={
								<Image
									roundedCircle
									src='profile.svg'
								/>}
						>
							<Dropdown.Item onClick={() => logout()}>Logout</Dropdown.Item>
						</DropdownButton>
					</Navbar.Collapse>}
			</Navbar>
			<Nav className="mb-4 float-left">
				{authenticated &&
					<Button
						variant={activePage === '/' ? 'primary' : 'outline-primary'}
						className="mr-2"
						href='/'
					>
						Dashboard <FontAwesomeIcon icon={['fas', 'home']} />
					</Button>}
				{authenticated &&
					<Button
						variant={activePage === '/actions' ? 'primary' : 'outline-primary'}
						href='/actions'
					>
						Action Manager <FontAwesomeIcon icon={['fas', 'tachometer-alt']} />
					</Button>}
			</Nav>
		</>)
}

export default Header