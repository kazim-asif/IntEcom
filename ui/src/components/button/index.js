/* eslint-disable react/prop-types */
import React from 'react'
import { Button } from 'react-bootstrap'

const CustomButton = ({
	variant,
	type,
	className,
	children,
	onClick,
	isDisabled
}) => {
    
	return (
		<Button variant={variant} type={type} className={className} disabled={isDisabled} onClick={onClick} style={{ fontFamily: 'Arial, sans-serif', color:"white", borderRadius:'0px', border:'0px'}}>
			{children}
		</Button>
	)
}

export default CustomButton
