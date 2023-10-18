import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

//pages
import AllProductsPage from '../pages/product/ProductsPage'
import CartPage from '../pages/cart/cart'

import ForgetPasswordPage from '../pages/auth/forget-password'
import LoginPage from '../pages/auth/login'
import NewPassPage from '../pages/auth/new-password'
import SignUpPage from '../pages/auth/signup'

//components
import Layout from '../components/layout'

const RouterLinks = ({
	user }) => {

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path='/'
					element={
						<Layout user={user} showNavbar={true}>
							{user.role!=='admin' ? <Navigate to='/products' /> : <Navigate to='/admin' />}
						</Layout>
					}
				/>
				<Route
					path='/login'
					element={
						<Layout user={user} showNavbar={false}>
							{!user.isLoggedIn ? <LoginPage /> : <Navigate to='/' />}
						</Layout>
					}
				/>
				<Route
					path='/signup'
					element={
						<Layout user={user} showNavbar={false}>
							{!user.isLoggedIn ? <SignUpPage /> : <Navigate to='/' /> }
						</Layout>
					}
				/>
				<Route
					path='/forget-pass'
					element={<ForgetPasswordPage />}
				/>
				<Route
					path='/new-pass/:token'
					element={<NewPassPage />}
				/>
				{user.role !== 'admin' &&
					<>
						<Route
							path='/products'
							element={
								<Layout user={user} showNavbar={true}>
									<AllProductsPage user={user} />
								</Layout>
							}
						/>
						<Route
							path='/cart'
							element={
								<Layout user={user} showNavbar={true}>
									{user.isLoggedIn ? <CartPage user={user} /> : <Navigate to='/login' />}
								</Layout>
							}
						/>
						
					</>
				}
				
				<Route path='*' element={<h1>Page Not Found!</h1>} />
			</Routes>
		</BrowserRouter>
	)
}

export default RouterLinks
