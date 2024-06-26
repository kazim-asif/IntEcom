import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import debounce from 'lodash.debounce'
//react-bootstrap
import { Container, Row, Col, Form, Image, Button, Modal } from 'react-bootstrap'
import Chart from 'chart.js/auto'

//components
import AlertComp from '../../../components/alert'
import DetailsTable from '../../../components/table'
import DeleteConfirmationModal from '../../../components/modal/delete-confirmation'
import Footer from '../../../components/footer'
import OffCanvasComp from '../../../components/offcanvas'
import OrderSummary from '../../../components/order-summary'
import ProductCanvas from '../../../components/product-canvas'
import SpinnerComp from '../../../components/spinner'

import Sidebar from '../../../components/sidebar/'
const MemoizedSideBar = React.memo(Sidebar)

//svg
import { ReactComponent as Trash } from '../../../static/images/svg/Trash.svg'
import { ReactComponent as Edit } from '../../../static/images/svg/Pencil square.svg'
import { ReactComponent as ArrowUpRight } from '../../../static/images/svg/Arrow up right.svg'

import {
	PackageIcon,
	ShoppingCartIcon,
	AnalyticsIcon,
	DiscountIcon,
	EndSaleIcon,
	FileWarningIcon,
	FolderIcon,
	UserIcon,
	PencilIcon
} from '../../../static/icons/admin-nav-icons'
import DescriptionGenerate from './desc-generate'
import OrderSummaryFilter from '../../../components/orderSummaryFilter'


const AllProducts = ({ user }) => {

	//states for pagination
	const [totalPages, setTotalPages] = useState(1)
	const [currentPage, setCurrentPage] = useState(1)
	const pageSize = 9
	const [sellers, setSellers] = useState([])

	const [processedOrders, setProcessedOrders] = useState([]) // New state for processed orders

	const [data, setData] = useState([])
	const [orderItem, setOrderItem] = useState()
	const [showOrderCanvas, setShowOrderCanvas] = useState(false)
	const [showProductCanvas, setShowProductCanvas] = useState(false)

	const [loading, setLoading] = useState(true)
	const [tableLoading, setTableLoading] = useState(true)
	const [fetchDataError, setFetchDataError] = useState(false)
	const [Errortext, setErrorText] = useState('')
	const [reportedProducts, setReportedProducts] = useState([]) // State for reported products
	const [reportLoading, setReportLoading] = useState(false) // Loading state for reports

	const [product, setproduct] = useState('')
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const [selectedItem, setSelectedItem] = useState('Products')
	const [searchTerm, setSearchTerm] = useState('')

	const searchInputRef = useRef(null)
	const [salesAnalytics, setSalesAnalytics] = useState(null)
	const chartRef = useRef(null)

	const [selectedProducts, setSelectedProducts] = useState([])
	const [showSaleConfirmationModal, setShowSaleConfirmationModal] = useState(false)
	const [salePercentage, setSalePercentage] = useState()
	const [notOnSale, setNotOnSale] = useState([])


	const [selectedProductsNotOnSale, setselectedProductsNotOnSale] = useState([])
	const [showEndSaleConfirmationModal, setShowEndSaleConfirmationModal] = useState(false)
	const [OnSale, setOnSale] = useState([])
	const [isAllEnd, setisAllEnd] = useState(false)
	const [isAllStart, setisAllStart] = useState(false)
	const [duration, setDuration] = useState(''); // Default to all orders

	const fetchSalesAnalytics = async () => {
		try {
			setTableLoading(true)
			axios.get(
				`${process.env.REACT_APP_DEV_BACKEND_URL}/orders/detailsAnalytics?prod=${searchTerm}&page=${currentPage}&size=${pageSize}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}
			).then((response) => {
				if (response.status && response.status === 200) {
					console.log(response)
					const totalPages = response.totalPages
					setSalesAnalytics(response.data)
					setFetchDataError(false)
					setTotalPages(totalPages)
				}
				setTimeout(() => {
					setLoading(false)
					setTableLoading(false)
				}, 1000)
			})

		} catch (error) {
			console.error('Error fetching sales analytics:', error)
			setFetchDataError(true)
			setTableLoading(false)
		}
	}

	const fetchData = () => {
		setFetchDataError(false)
		if (selectedItem == 'Products' || selectedItem == "Orders Summary") {
			var temp
			if (selectedItem == 'Products') {
				temp = selectedItem
			} else {
				temp = 'Orders'
			}

			axios.get(
				`${process.env.REACT_APP_DEV_BACKEND_URL}/${temp.toLowerCase()}?searchQuery=${searchTerm}&page=${currentPage}&size=${pageSize}&duration=${duration}`,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			).then((response) => {
				if (response.status && response.status === 200) {
					const { totalPages, data } = response.data
					console.log(response);
					setData(data)
					setFetchDataError(false)
					setTotalPages(totalPages)
				}
				setTimeout(() => {
					setLoading(false)
					setTableLoading(false)
				}, 1000)
			}).catch((error) => {
				if (error.response?.status && error.response.status === 401) {
					setErrorText('Unauthorized. Try login again')
				}
				else
					selectedItem === 'Products' ?
						setErrorText('Error while fetching products') : setErrorText('Error while fetching orders')
				setFetchDataError(true)
				setTimeout(() => {
					setLoading(false)
					setTableLoading(false)
				}, 1000)
			})
		}


	}

	// Debounced version of fetchData
	const debouncedFetchData = debounce(fetchData, 1000)

	const handleTrashClick = (itemId) => {
		setproduct(itemId)
		setShowDeleteModal(true)
	}

	const fetchProcessedOrders = async () => {
		try {
			setTableLoading(true) // Start loading
			const response = await axios.get(`${process.env.REACT_APP_DEV_BACKEND_URL}/orders/seller-orders`, {
				headers: { Authorization: `Bearer ${user.token}` }
			})
			const { totalPages, data } = response.data
			setProcessedOrders(data)
			setTotalPages(totalPages)
			setTableLoading(false) // Stop table loading
		} catch (error) {
			console.error('Error fetching processed orders:', error)
			setErrorText('Error fetching processed orders')
			setFetchDataError(true)
			setTableLoading(false) // Stop table loading
		}
	}

	const handleDeleteConfirmation = () => {
		if (product) {

			setLoading(true)
			setFetchDataError(false)

			axios.delete(
				`${process.env.REACT_APP_DEV_BACKEND_URL}/products/${product._id}`,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			).then((response) => {
				if (response.status && response.status === 200) {
					setCurrentPage(1)
					fetchData()
				}
				setTimeout(() => {
					setLoading(false)
					setTableLoading(true)
				}, 1000)
			}).catch((error) => {
				setErrorText(error.response.data)
				setFetchDataError(true)
				setTimeout(() => {
					setLoading(false)
				}, 1000)
			})
			setproduct(null)
			setShowDeleteModal(false)
		}

		setTableLoading(true)
	}

	const handleEditClick = (item) => {
		setproduct(item)
		setShowProductCanvas(true)
	}
	// Function to handle shipping an order
	const handleShip = async (orderId) => {
		try {
			await axios.patch(`${process.env.REACT_APP_DEV_BACKEND_URL}/orders/ship/${orderId}`, {}, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			})
			// Refresh the processed orders list
			fetchProcessedOrders()
		} catch (error) {
			console.error('Error shipping order:', error)
		}
	}
	// Function to handle delivering an order
	const handleDeliver = async (orderId) => {
		try {
			await axios.patch(`${process.env.REACT_APP_DEV_BACKEND_URL}/orders/deliver/${orderId}`, {}, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			})
			// Refresh the processed orders list
			fetchProcessedOrders()
		} catch (error) {
			console.error('Error delivering order:', error)
		}
	}

	const handleAddClick = () => {
		setproduct(null)
		setShowProductCanvas(true)
	}

	const handleShouldFetchAgain = () => {
		fetchData()
	}

	const handleSearchChange = (event) => {
		const { value } = event.target
		setSearchTerm(value)
		setTableLoading(true)
		setCurrentPage(1)
	}

	const handleOrderDetailButtonClick = (item) => {
		setOrderItem(item)
		setShowOrderCanvas(true)
	}

	const handlePageChange = (page) => {
		setTableLoading(true)
		setCurrentPage(page)
	}

	useEffect(() => {
		setLoading(true)
		if (searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [])

	useEffect(() => {
		if (chartRef.current && salesAnalytics) {
			const ctx = chartRef.current.getContext('2d')

			const data = {
				labels: salesAnalytics.map((item, index) => index + 1),
				datasets: [
					{
						label: 'Total Quantity Sold',
						data: salesAnalytics.map(item => item.totalQuantitySold),
						backgroundColor: 'rgba(75, 192, 192, 0.2)',
						borderColor: 'rgba(75, 192, 192, 1)',
						borderWidth: 1,
					},
					{
						label: 'Total Price Earned',
						data: salesAnalytics.map(item => item.totalCost),
						backgroundColor: 'rgba(255, 99, 132, 0.2)',
						borderColor: 'rgba(255, 99, 132, 1)',
						borderWidth: 1,
					},
				],
			}

			const options = {
				indexAxis: 'y', // Use 'y' for horizontal bar chart
				scales: {
					x: {
						beginAtZero: true,
					},
				},
			}

			let myChart = new Chart(ctx, {
				type: 'bar',
				data,
				options,
			})

			// Ensure that the previous Chart instance is destroyed
			return () => {
				myChart.destroy()
			}
		}
	}, [salesAnalytics])

	useEffect(() => {
		if (selectedItem == 'Products') {
			debouncedFetchData()
			// Cleanup the debounced function when the component is unmounted
			return () => {
				//return
				debouncedFetchData.cancel()
			}
		} else if (selectedItem == 'Orders Summary') {
			debouncedFetchData()
		} else if (selectedItem === 'Seller Requests') {
			fetchSellers()
		} else if (selectedItem === 'Process Orders') {
			fetchProcessedOrders()
		} else if (selectedItem === 'Reported Products') {
			fetchReportedProducts()
		} else if (selectedItem === 'Analytics') {
			fetchSalesAnalytics()
		} else if (selectedItem === 'Discount Management') {
			// loadNotOnDiscount()
			debouncedLoadNotOnDiscount()
		} else if (selectedItem === 'End Sale') {
			// loadOnDiscount()
			debouncedLoadOnDiscount()
		}

	}, [currentPage, selectedItem, searchTerm, duration])

	const handleItemClick = (item) => {
		setCurrentPage(1)
		if(item!='Generate Description')
			setTableLoading(true)

		setSelectedItem(item)
		setSearchTerm()
	}

	const fetchReportedProducts = async () => {
		setReportLoading(true) // Start loading for reported products
		setTableLoading(true)      // Start main loading
		try {
			const response = await axios.get(`${process.env.REACT_APP_DEV_BACKEND_URL}/products/all-reports`, {
				headers: { Authorization: `Bearer ${user.token}` }
			})

			setReportedProducts(response.data)
			setTableLoading(false)       // Stop main loading
		} catch (error) {
			// console.error('Error fetching reported products:', error)
			setErrorText('Error fetching reported products')
			setFetchDataError(true)
			setTableLoading(false)       // Stop main loading
		} finally {
			setReportLoading(false) // Stop loading for reported products
		}
	}

	const fetchSellers = async () => {
		try {
			setTableLoading(true)
			axios.get(`${process.env.REACT_APP_DEV_BACKEND_URL}/users/sellers?/page=${currentPage}&size=${pageSize}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}).then((response) => {
				console.log(response)
				setSellers(response.data.sellers)
				setTotalPages(response.data.totalPages)
				setTableLoading(false)
			}).catch((error) => {
				console.error('Error fetching sellers:', error)
				setTableLoading(false)
			})

		} catch (error) {
			console.error('Error fetching sellers:', error)
			setTableLoading(false)
		}
	}

	const handleAcceptSeller = async (sellerId) => {
		try {
			await axios.patch(`${process.env.REACT_APP_DEV_BACKEND_URL}/users/sellers/accept/${sellerId}`, {}, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			})
			// Refresh the sellers list after accepting
			fetchSellers()
		} catch (error) {
			console.error('Error accepting seller:', error)
		}
	}

	const handleRejectSeller = async (sellerId) => {
		try {
			await axios.patch(`${process.env.REACT_APP_DEV_BACKEND_URL}/users/sellers/reject/${sellerId}`, {}, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			})
			// Refresh the sellers list after rejecting
			fetchSellers()
		} catch (error) {
			console.error('Error rejecting seller:', error)
		}
	}

	const SellerTablecolumns = [
		{
			header: 'Name',
			render: (sellers) => sellers.name,
		},
		{
			header: 'Email',
			render: (sellers) => sellers.email,
		},
		{
			header: 'Actions',
			render: (sellers) => (
				<>
					<Button onClick={() => handleAcceptSeller(sellers._id)} variant="primary">Accept</Button>
					<Button onClick={() => handleRejectSeller(sellers._id)} variant="danger" className="ms-2">Reject</Button>
				</>
			),
		},
	]

	//seller analytics information
	const SellersTablecolumns = [
		{
			header: '#', // Row index header
			render: (detail, index) => index + 1, // Row index render function
			className: 'bg-light',
			backgroundColor: ''
			// width: '10%' // Width of the row index column (adjust as needed)
		},
		{
			header: 'Product',
			render: (seller) => seller.name,
		},
		{
			header: 'Total Quantity Sold',
			render: (seller) => seller.totalQuantitySold,
		},
		{
			header: 'Total Price Earned',
			render: (seller) => seller.totalCost.toFixed(2),
		},
	]

	// Product table column styling
	const ProductsTablecolumns = [
		{
			header: 'Title',
			width: '32rem',
			render: (item) => (
				<div className='row align-items-center pe-5'>
					<div className='col-auto pe-0' >
						<Image src={item.image} alt='Product' className='table-product-img' />
					</div>
					<div className='col'>
						<span>{item.description}</span>
					</div>
				</div>
			),
		},
		{
			header: 'Price',
			width: '17rem',
			render: (product) => (
				product.price
			),
		},
		{
			header: 'Stock',
			width: '15rem',
			render: (product) => product.quantity
		},
		{
			header: 'Actions',
			render: (item) => (
				<>
					<button className='d-flex gap-2 px-2 py-1'
						style={{ border: 'none', paddingLeft: '0px', }}>
						<Trash onClick={() => handleTrashClick(item)} />
						<Edit onClick={() => handleEditClick(item)} />
					</button>
				</>
			),
		},
	]

	const handleBlockProduct = async (productId) => {
		try {
			const response = await axios.patch(`${process.env.REACT_APP_DEV_BACKEND_URL}/products/block/${productId}`, {}, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			})
			// Handle response here, such as updating state or showing a success message
			console.log('Product blocked successfully', response.data)
			// Optionally, refresh the data to reflect the changes
			fetchReportedProducts()
		} catch (error) {
			console.error('Error blocking product:', error)
			// Handle error here, such as updating state or showing an error message
		}
	}

	const handleCancelReport = async (reportId) => {
		try {
			const response = await axios.delete(`${process.env.REACT_APP_DEV_BACKEND_URL}/products/cancel-report/${reportId}`, {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			})
			// Handle response here, such as updating state or showing a success message
			console.log('Report canceled successfully', response.data)
			// Optionally, refresh the data to reflect the changes
			fetchReportedProducts()
		} catch (error) {
			console.error('Error canceling report:', error)
			// Handle error here, such as updating state or showing an error message
		}
	}

	const ReportedProductsTableColumns = [
		// Define columns for reported products table
		{
			header: 'Reported Product',
			width: '22rem',
			render: (report) => report.product.description,
		},
		{
			header: 'Reported By',
			width: '14rem',
			render: (report) => report.user.name,
		},
		{
			header: 'Reason',
			width: '27rem',
			render: (report) => report.text,
		},
		// ... other columns for product details
		{
			header: 'Actions',
			width: '20rem',
			render: (report) => (
				<>
					<Button onClick={() => handleBlockProduct(report.product._id)} variant="danger">Block</Button>
					<Button onClick={() => handleCancelReport(report._id)} variant="primary" className="ms-2">Cancel</Button>
				</>
			),
		},
	]

	// Order table column styling
	const OrdersTablecolumns = [
		{
			header: 'Date',
			width: '17rem',
			render: (item) => {
				const date = new Date(item.date)
				// const utcDate = date.toLocaleString('en-US', { timeZone: 'UTC' })
				const localDate = date.toLocaleString(undefined, { timeZoneName: 'short' })

				return localDate
			}
		},
		{
			header: 'Order#',
			width: '20rem',
			render: (item) => item.orderNumber
		},
		{
			header: 'User',
			width: '20rem',
			render: (item) => {
				if (item.user) {
					return item.user.name
				}
				return ''
			}
		},
		{
			header: 'Product(s)',
			width: '20rem',
			render: (item) => {
				// const totalProducts = item.products.length
				if (item.products) {
					return item.products.length
				}
				return 1
			}
		},
		{
			header: 'Amount',
			width: '17rem',
			render: (item) => {
				if (item.totalAmount)
					return 'PKR ' + item.totalAmount.toFixed(2)
				return 'PKR ' + 0
			}
		},
		{
			header: 'Action',
			render: (item) => (
				<>
					<button className=" border-0" onClick={() => handleOrderDetailButtonClick(item)}><ArrowUpRight /></button>
				</>
			),
		},
	]

	const ProcessedOrdersTableColumns = [
		{
			header: 'Date',
			width: '17rem',
			render: (item) => {
				const date = new Date(item.date)
				const localDate = date.toLocaleString(undefined, { timeZoneName: 'short' })
				return localDate
			}
		},
		{
			header: 'Order#',
			width: '10rem',
			render: (item) => item.orderNumber
		},
		{
			header: 'User Address',
			width: '22rem',
			render: (item) => {
				const { shippingDetails } = item
				return `${shippingDetails.name}, ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state}, ${shippingDetails.zip}, ${shippingDetails.country}`
			}
		},
		{
			header: 'Product Description',
			width: '28rem',
			render: (item) => {
				return item.products.map(p => `${p.product.description} (Qty: ${p.quantity})`).join(', ')
			}
		},
		{
			header: 'Action',
			render: (item) => (
				<div className='d-flex gap-2'>
					<Button
						onClick={() => handleShip(item._id)}
						variant="dark"
						disabled={item.products.some(p => p.deliverStatus !== 'Pending')}
					>
						Ship
					</Button>
					<Button
						onClick={() => handleDeliver(item._id)}
						variant="primary"
						disabled={item.products.some(p => p.deliverStatus !== 'Shipped')}
					>
						Deliver
					</Button>
				</div>
			),
		},
	]

	const handleCheckboxChange = (productId) => {
		const updatedSelectedProducts = [...selectedProducts]
		if (updatedSelectedProducts.includes(productId)) {
			// Product is already selected, remove it
			const index = updatedSelectedProducts.indexOf(productId)
			updatedSelectedProducts.splice(index, 1)
		} else {
			// Product is not selected, add it
			updatedSelectedProducts.push(productId)
		}
		setSelectedProducts(updatedSelectedProducts)
	}

	const handleConfirmSale = async () => {
		try {
			// Prepare the data to be sent to the server
			let saleData = {
				productIds: selectedProducts,
				offPercent: salePercentage,
				flag: false
			}
			console.log(saleData);
			if (isAllStart) {
				saleData.flag = true
			}
			// Send the data to the server
			const response = await axios.post(
				`${process.env.REACT_APP_DEV_BACKEND_URL}/products/put-on-sale`,
				saleData,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			)

			// Handle the response here, such as updating state or showing a success message
			if (response.status == 200) {
				// Update the state 'notOnSale' by filtering out the products that are in 'selectedProducts'
				setNotOnSale((prevProducts) =>
					prevProducts.filter((product) => !selectedProducts.includes(product._id))
				)
			}
			if (isAllStart) {
				setNotOnSale([])
				setisAllStart(false)
				setShowSaleConfirmationModal(false)
			}

			// After processing the sale, you can reset the state
			setSelectedProducts([])
			setSalePercentage(0)

			// Close the confirmation modal
			setShowSaleConfirmationModal(false)
		} catch (error) {
			console.error('Error confirming sale:', error)
			// Handle error here, such as updating state or showing an error message
		}
	}

	///////for on sale management table
	const productsColumns = [
		{
			header: 'Product',
			width: '32rem',
			render: (item) => item.description,

		}, {
			header: 'Price',
			width: '15rem',
			render: (item) => item.price.toFixed(2)

		}, {
			header: 'Stock',
			width: '15rem',
			render: (item) => item.quantity,

		},
		{
			header: 'Select',
			render: (item) => (
				<Form.Check
					type="checkbox"
					checked={selectedProducts.includes(item._id)}
					onChange={() => handleCheckboxChange(item._id)}
				/>
			),
		},
	]

	const loadNotOnDiscount = async () => {
		try {

			setTableLoading(true)
			const response = await axios.get(
				`${process.env.REACT_APP_DEV_BACKEND_URL}/products/not-on-discount?prod=${searchTerm}&page=${currentPage}&size=${pageSize}`,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			)
			if (response.status === 200) {
				console.log(response.data)
				setNotOnSale(response.data.data)
				setFetchDataError(false)
				setTotalPages(response.data.totalPages)
			}
		} catch (error) {
			console.error('Error fetching products not on discount:', error)
			setFetchDataError(true)
		} finally {
			setTableLoading(false)
		}
	}

	const debouncedLoadNotOnDiscount = debounce(loadNotOnDiscount, 1700)

	/////end sale
	const loadOnDiscount = async () => {
		try {

			setTableLoading(true)
			const response = await axios.get(
				`${process.env.REACT_APP_DEV_BACKEND_URL}/products/on-discount?prod=${searchTerm}&page=${currentPage}&size=${pageSize}`,
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			)
			if (response.status === 200) {
				setOnSale(response.data.data)
				setFetchDataError(false)
				setTotalPages(response.data.totalPages)
			}
		} catch (error) {
			console.error('Error fetching products not on discount:', error)
			setFetchDataError(true)
		} finally {
			setTableLoading(false)
		}
	}

	const debouncedLoadOnDiscount = debounce(loadOnDiscount, 1700)

	const EndSaleProductsColumns = [
		{
			header: 'Product',
			width: '32rem',
			render: (item) => item.description,

		},
		{
			header: 'Current Price',
			width: '15rem',
			render: (item) => item.price.toFixed(2),

		},
		{
			header: 'Original Price',
			width: '15rem',
			render: (item) => item.originalPrice.toFixed(2),

		},
		{
			header: 'Stock',
			width: '15rem',
			render: (item) => item.quantity,

		},
		{
			header: 'Sale Percentage',
			width: '15rem',
			render: (item) => item.offPercent,

		},
		{
			header: 'Select',
			render: (item) => (
				<Form.Check
					type="checkbox"
					checked={selectedProductsNotOnSale.includes(item._id)}
					onChange={() => handleCheckboxChangEndSale(item._id)}
				/>
			),
		},
	]
	const handleConfirmEndSale = async () => {
		try {
			// Prepare the data to be sent to the server
			let saleData = {
				productIds: selectedProductsNotOnSale,
				flag: false
			}

			if (isAllEnd) {
				saleData.flag = true
			}
			// Send the data to the server
			const response = await axios.post(
				`${process.env.REACT_APP_DEV_BACKEND_URL}/products/end-sale`,
				saleData,

				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				}
			)

			// Handle the response here, such as updating state or showing a success message
			if (response.status == 200) {
				// Update the state 'notOnSale' by filtering out the products that are in 'selectedProducts'
				setOnSale((prevProducts) =>
					prevProducts.filter((product) => !selectedProductsNotOnSale.includes(product._id))
				)
			}
			if (isAllEnd) {
				setOnSale([])
				setisAllEnd(false)
				setShowEndSaleConfirmationModal(false)
			}

			// After processing the sale, you can reset the state
			setselectedProductsNotOnSale([])

			// Close the confirmation modal
			setShowEndSaleConfirmationModal(false)
		} catch (error) {
			console.error('Error confirming sale:', error)
			// Handle error here, such as updating state or showing an error message
		}
	}

	const handleCheckboxChangEndSale = (productId) => {
		const updatedSelectedProducts = [...selectedProductsNotOnSale]
		if (updatedSelectedProducts.includes(productId)) {
			// Product is already selected, remove it
			const index = updatedSelectedProducts.indexOf(productId)
			updatedSelectedProducts.splice(index, 1)
		} else {
			// Product is not selected, add it
			updatedSelectedProducts.push(productId)
		}
		setselectedProductsNotOnSale(updatedSelectedProducts)
	}

	const sidebarItems = [
		{ id: 1, icon: <PackageIcon className="h-5 w-5" />, text: 'Products' },
		{ id: 2, icon: <ShoppingCartIcon className="h-5 w-5" />, text: 'Process Orders' },
		{ id: 3, icon: <DiscountIcon className="h-5 w-5" />, text: 'Discount Management' },
		{ id: 4, icon: <EndSaleIcon className="h-5 w-5" />, text: 'End Sale' },
		{ id: 5, icon: <AnalyticsIcon className="h-5 w-5" />, text: 'Analytics' },
		{ id: 6, icon: <UserIcon className="h-5 w-5" />, text: 'Orders Summary' },
		{ id: 7, icon: <FolderIcon className="h-5 w-5" />, text: 'Seller Requests' },
		{ id: 8, icon: <FileWarningIcon className="h-5 w-5" />, text: 'Reported Products' },
		{ id: 8, icon: <PencilIcon className="h-5 w-5" />, text: 'Generate Description' },
	];

	return (
		<>
			{loading ? (
				<SpinnerComp />
			) : (
				<Container fluid className='pt-0 pe-3 ps-0'>
					<Row>
						<Col xs={3}>
							<MemoizedSideBar sidebarItems={sidebarItems} selectedItem={selectedItem} handleItemClick={handleItemClick} />
						</Col>
						<Col className="mt-4 px-3 pb-4">
							{selectedItem == 'Orders Summary' && <OrderSummary user={user} setErrorText={setErrorText} selectedItem={'Orders'} duration={duration} />}
							{selectedItem === 'Analytics' && <OrderSummary user={user} setErrorText={setErrorText} selectedItem={selectedItem} />}

							<Row className='mb-3 m-0'>
								<Col className='d-flex justify-content-start ps-0 align-items-center'>
									<h2 className='text-primary' style={{ fontFamily: 'Arial, sans-serif' }}>{selectedItem}</h2>
								</Col>
								<Col className='d-flex justify-content-end pe-0 align-items-center'>
									{	selectedItem === 'Products' ? (
											<>
												<Form.Label className="me-2 mt-1 text-light"><b>Search:</b></Form.Label>
												<Form.Group className="mb-1 mt-1">
													<Form.Control
														size='sm'
														className='pe-5'
														type="text"
														value={searchTerm}
														placeholder={`Search Product`}
														onChange={handleSearchChange}
														ref={searchInputRef}
													/>
												</Form.Group>
												<Button variant='primary' size='sm' onClick={handleAddClick} className='px-3  ms-2' style={{}}>Add Product</Button>

											</>
										) : selectedItem === 'Orders Summary' ? (
											<>
												<OrderSummaryFilter duration={duration} setDuration={setDuration} />
												
												<Form.Label className="mx-2 text-semibold text-light"><b>Search:</b></Form.Label>
												<Form.Group className="">
													<Form.Control
														size='sm'
														className='pe-5'
														type="text"
														value={searchTerm}
														placeholder={`Search by Order#`}
														onChange={handleSearchChange}
														ref={searchInputRef}
													/>
												</Form.Group>
											</>
										) : selectedItem === 'Discount Management' ? (
											<>
												<Button size='sm' variant='primary' onClick={() => {
													setShowSaleConfirmationModal(true)
													setisAllStart(true)
												}} disabled={salePercentage <= 0 || notOnSale.length == 0} style={{}}>Apply on All</Button>
												<div style={{ marginRight: '10px' }}></div>
												<Button size='sm' variant='primary' onClick={() => setShowSaleConfirmationModal(true)} disabled={salePercentage <= 0 || selectedProducts.length == 0} style={{}}>
													Apply on Selected
												</Button>
												<Form.Group className="ms-2">
													<Form.Control
														size='sm'
														type="number"
														value={salePercentage}
														placeholder="Discount %"
														onChange={(e) => setSalePercentage(e.target.value)}
														min="0"
													/>
												</Form.Group>
											</>
										) : selectedItem == 'End Sale' && (
											<Col className='d-flex justify-content-end pe-0 align-items-center'>
												<Button size='sm' variant='primary' onClick={() => setShowEndSaleConfirmationModal(true)} disabled={selectedProductsNotOnSale.length == 0} style={{}}>End Sale for selected</Button>
												<div style={{ marginRight: '10px' }}></div>
												<Button size='sm' variant='primary' onClick={() => {
													setShowEndSaleConfirmationModal(true)
													setisAllEnd(true)
												}} disabled={OnSale.length == 0} style={{}}>End Sale for all</Button>
											</Col>
										)
									}
								</Col>
							</Row>
							{selectedItem === 'Analytics' &&
								<Row className='mb-4 m-0'>
									<Col className='mb-4 p-0 bg-light'>
										{salesAnalytics && (
											<canvas ref={chartRef} id="salesChart"></canvas>
										)}

									</Col>
								</Row>
							}
							{(selectedItem === "Discount Management" || selectedItem === "End Sale") && (
								<Row className="justify-content-between align-items-center mb-3">
									<Col md={4}>
										{/* Left side content or empty if not needed */}
									</Col>
									<Col md={8}>
										<div className="d-flex justify-content-end">
											<Form.Label htmlFor="searchInput" className="me-2 align-self-center text-light"><b>Search:</b></Form.Label>
											<Form.Control
												size="md"
												id="searchInput"
												className='pe-5'
												type="text"
												value={searchTerm}
												placeholder={`Search Product`}
												onChange={handleSearchChange}
												ref={searchInputRef}
												style={{ width: 'auto' }}  // Adjust width as necessary
											/>
										</div>
									</Col>
								</Row>
							)}

							{/* Sale confirmation modal */}
							<Modal show={showSaleConfirmationModal} onHide={() => setShowSaleConfirmationModal(false)}>
								<Modal.Header closeButton>
									<Modal.Title>Confirm Sale</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									Are you sure you want to put the products on sale with a {salePercentage}% discount?
								</Modal.Body>
								<Modal.Footer>
									<Button variant="secondary" onClick={() => setShowSaleConfirmationModal(false)}>
										Cancel
									</Button>
									<Button variant="primary" onClick={handleConfirmSale}>
										Confirm
									</Button>
								</Modal.Footer>
							</Modal>


							{/* end Sale confirmation modal */}
							<Modal show={showEndSaleConfirmationModal} onHide={() => setShowEndSaleConfirmationModal(false)}>
								<Modal.Header closeButton>
									<Modal.Title>Confirm End Sale</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									Are you sure you want to put products on back on origional price?
								</Modal.Body>
								<Modal.Footer>
									<Button variant="secondary" onClick={() => setShowEndSaleConfirmationModal(false)}>
										Cancel
									</Button>
									<Button variant="primary" onClick={handleConfirmEndSale}>
										Confirm
									</Button>
								</Modal.Footer>
							</Modal>

							
								<div className='border shadow-sm rounded' style={{ height: '31rem', overflowY: 'auto' }}>
									{tableLoading ? (
										<SpinnerComp />
									) : selectedItem === 'Process Orders' ? (
										<DetailsTable
											data={processedOrders}
											columns={ProcessedOrdersTableColumns}
										/>
									) : selectedItem === 'Seller Requests' ? (
										<DetailsTable
											data={sellers}
											columns={SellerTablecolumns}
										/>
									) : selectedItem === 'Analytics' && salesAnalytics ? (
										<DetailsTable
											data={salesAnalytics}
											columns={SellersTablecolumns}
										/>
									) : selectedItem === 'Discount Management' ? (
										<DetailsTable
											data={notOnSale}
											columns={productsColumns}
										/>
									) : selectedItem === 'End Sale' ? (
										<DetailsTable
											data={OnSale}
											columns={EndSaleProductsColumns}
										/>
									) : selectedItem === 'Products' ? (
										<DetailsTable
											data={data}
											columns={ProductsTablecolumns}
										/>
									) : selectedItem === 'Orders Summary' ? (
										<DetailsTable
											data={data}
											columns={OrdersTablecolumns}
										/>
									) : selectedItem === 'Reported Products' ? (
										<DetailsTable
											data={reportedProducts}
											columns={ReportedProductsTableColumns}
										/>
									) : selectedItem == 'Generate Description' ? (
										<DescriptionGenerate />
									) : (
										<></>
									)}
								</div>
							

							<Footer
								className={'d-flex justify-content-between align-items-center pt-4 ps-1 pe-0'}
								text={''}
								totalPages={totalPages}
								currentPage={currentPage}
								setCurrentPage={handlePageChange}
							/>
						</Col>
					</Row >

					{fetchDataError && (
						<AlertComp
							variant='danger'
							text={Errortext}
							onClose={() => setFetchDataError(false)}
						/>
					)
					}

					{
						showDeleteModal && (
							<DeleteConfirmationModal
								showDeleteModal={showDeleteModal}
								setShowDeleteModal={setShowDeleteModal}
								handleDeleteConfirmation={handleDeleteConfirmation}
							/>
						)
					}

					{
						showOrderCanvas && (
							<OffCanvasComp
								placement={'end'}
								show={showOrderCanvas}
								setShow={setShowOrderCanvas}
								orderItem={orderItem}
								name={orderItem.user.name}
								token={user.token}
							/>
						)
					}

					{
						showProductCanvas && (
							<ProductCanvas
								placement={'end'}
								show={showProductCanvas}
								setShow={setShowProductCanvas}
								product={product}
								handleShouldFetchAgain={handleShouldFetchAgain}
								token={user.token}
							/>
						)
					}
				</Container >
			)}
		</>
	)


}

export default AllProducts