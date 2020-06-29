import { library } from '@fortawesome/fontawesome-svg-core'
import { faBell as RegularBell, faCreditCard } from '@fortawesome/free-regular-svg-icons'
import { faBell as SolidBell, faHome as Home, faTachometerAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

library.add(
	RegularBell,
	SolidBell,
	Home,
	faTachometerAlt,
	faCreditCard,
	faExclamationTriangle
)