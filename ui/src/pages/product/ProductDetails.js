import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavbarSider from '../../components/navbar-sider/navbarSider';
import { HomeIcon, PackageIcon, BoxIcon, ShoppingCartIcon, UserIcon, HeartIcon } from '../../static/icons/navicons.js';
import { ReactComponent as ColorIcon } from '../../static/images/svg/Ellipse 1.svg';
import CurrencyConverter from '../../components/Price/CurrencyConverter.js';
import './ProductDetails.css';
import { Container, Row, Col, Button, Card, Image, Badge, Modal, Form } from 'react-bootstrap';
import SpinnerComp from '../../components/spinner';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { add as addToCartAction, increase as increaseInCart } from '../../redux/slice/cart/cart-slice';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const ProductDetailPage = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart.products);
  const [reporting, setReporting] = useState(false);
  const [hasUserReported, setHasUserReported] = useState(false);
  const [isProductInWishlist, setIsProductInWishlist] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reportText, setReportText] = useState('');

  const wishlist = location.state?.wishlist || [];
  const productId = location.state?.productId || null;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const isProductInCart = cartProducts.some(item => item._id === productId);

  useEffect(() => {
    if (productId) {
      setIsProductInWishlist(wishlist.some(item => item._id === productId));

      const fetchProductDetails = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_DEV_BACKEND_URL}/products/${productId}`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          if (response.status === 200) {
            setProduct(response.data);
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        } finally {
          setLoading(false);
        }
      };

      const checkUserReports = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_DEV_BACKEND_URL}/products/reports/${productId}`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          if (response.data.userHasReported) {
            setHasUserReported(true);
          }
        } catch (error) {
          console.error('Error checking user reports:', error);
        }
      };

      fetchProductDetails();
      checkUserReports();
    } else {
      setLoading(false);
      navigate('/products');
    }
  }, [productId, user.token]);

  const handleAddToCart = () => {
    const item = { ...product, orderQuantity: 1 };
    if (!isProductInCart) {
      dispatch(addToCartAction(item));
    } else {
      dispatch(increaseInCart(productId));
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_DEV_BACKEND_URL}/wishlist/add`, {
        productId: product._id,
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setIsProductInWishlist(true);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const handleReportProduct = () => {
    setShowModal(true);
  };

  const handleConfirmReport = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_DEV_BACKEND_URL}/products/report`, {
        productId: product._id,
        reportText: reportText,
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setReporting(true);
    } catch (error) {
      console.error('Error reporting product:', error);
    } finally {
      setShowModal(false);
      setReportText('');
    }
  };

  if (loading) {
    return <SpinnerComp />;
  }
  const cartLength = cartProducts.length;

  function HeartIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    );
  }

  return (
    <Container className="mt-5">
      {product && (
        <div className='container my-4'>
          <Row className="px-2 py-3 align-items-center cust-nav-sider-card product-detail text-black">
            <Col md={5} className='text-center'>
              <Image className='img-fluid rounded mb-3' src={product.image} alt={product.name} style={{ maxHeight: '100%' }} />
              <br /><br /><br />
              <div className='thumbnail'>
                <Image
                  src={product.image}
                  alt={product.name + " thumbnail"}
                  className='img-thumbnail cursor-pointer'
                  onClick={() => {/* function to handle image click */ }}
                  style={{ maxWidth: '80px' }}
                />
              </div>
            </Col>

            <Col md={7} className="py-4 position-relative">
              {product.isOnSale && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  backgroundColor: 'green',
                  color: 'white',
                  transform: 'rotate(-25deg)',
                  transformOrigin: 'left bottom',
                  fontSize: '14px',
                  padding: '5px 10px',
                  borderTopRightRadius: '10px',
                  borderBottomRightRadius: '10px',
                }}>
                  {product.offPercent}% OFF
                </div>
              )}
              <div className="text-left ps-2">
                <h3 className="fw-bold text-primary">{product.name}</h3>
                <hr /><br />
                <p className=''><strong>Description:</strong> <span className='text-slate-800'>{product.description}</span></p>
                
                <p>
                  <strong className=''>Price: </strong>
                  {product.isOnSale ? (
                    <>
                      <span className='px-1 text-danger' style={{ textDecoration: 'line-through' }}>
                        PKR {product.originalPrice.toFixed(2)}
                      </span>
                      {' '}
                      <span style={{ color:'green'}}>
                        PKR {(
                          product.originalPrice -
                          (product.originalPrice * (product.offPercent / 100))
                        ).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: 'green' }}>
                      PKR {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </p>        
                <p><strong className=''>Category:</strong> 
                  <span className='text-slate-800'>{product.category}</span>
                </p>
                <p style={{ display: 'flex', flexDirection: 'row' }}>
                  <strong className='' style={{ marginRight: '5px' }}>Colour:</strong> 
                    <span className='text-slate-800'>{product.color}</span>
                  <ColorIcon width="28" height="28" fill={product.color} />
                </p>
                <p><strong className=''>Size:</strong> <span className='text-slate-800'>{product.size}</span></p>
              </div>
              <Form className='ps-2'>
                <div>
                  <p className=" fw-bold">Quantity Available: <span className="text-primary">{product.quantity}</span></p>
                </div>
                <div className="d-grid gap-2">
                  <Button variant="" size="lg" className="bg-black text-white mb-2" onClick={handleAddToCart} disabled={isProductInCart || product.quantity == 0}>
                    {isProductInCart ? 'Already In Cart' : product.quantity == 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button variant="outline-primary" size="lg" className="mb-2" onClick={handleAddToWishlist} disabled={isProductInWishlist} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartIcon className="w-4 h-4" /> {/* Heart icon */}
                    <span className="mx-1">
                      {isProductInWishlist ? 'Added' : 'Wishlist'}
                    </span>
                  </Button>
                  <Button variant="outline-danger" size="lg" className="mb-2" onClick={handleReportProduct} disabled={reporting || hasUserReported}>
                    {hasUserReported ? 'Reported' : 'Report Product'}
                  </Button>
                  {product.modelPath && (
                    <Button
					variant="outline-info"
					size="lg"
					className="mb-2"
					onClick={() => window.open(`/model-viewer?modelPath=${product.modelPath}`, '_blank')}
					disabled={!product.modelPath}
					>
					View 3D Model
					</Button>
                  )}
                </div>
              </Form>
            </Col>
          </Row>

          <hr /><br /><br /><br />
          <Tabs
            defaultActiveKey="Payments Policy"
            className="mb-3 bg-light rounded"
          >
            <Tab eventKey="Payments Policy" title="Payments Policy" className='p3'>
              <br />
              <h5 className='text-info'>
                Payments
              </h5>
              <p className='text-slate-300'>
                At IntEcom, we value your security and convenience. Our secure payment system is powered by Stripe, one of the most trusted online payment solutions on the web. Stripe is certified to PCI Service Provider Level 1, the most stringent level of certification available in the payments industry. This means that when you shop with us, you can rest assured that your payment information is safe and protected.

                We accept a variety of payment methods including major credit cards and digital wallets, ensuring that you can shop with ease. Once your order is confirmed, Stripe securely processes your payment, and you will receive an order confirmation via email.
              </p>
            </Tab>
            <Tab eventKey="Shipping Policy" title="Shipping Policy">
              <br />
              <h5 className='text-info'>
                Shipping
              </h5>
              <p className='text-slate-300'>
                Upon successful payment, your order information is immediately sent to the respective seller responsible for fulfillment. Our trusted network of sellers is committed to providing you with timely and efficient service. Each seller directly manages the shipping process for their products, which allows them to provide you with accurate updates.

                The seller will handle the packaging and dispatch of your purchase. You can expect to receive shipping and delivery updates as the seller updates the status in our database during the key stages of fulfillment: Shipped when the item leaves their facility and Delivered once it arrives at your doorstep.

                We aim to create a seamless shopping experience, from the moment you place your order to the moment its delivered to your location.

                For any queries or assistance with your order, our customer support team is always on standby to help ensure that your shopping experience is as smooth as possible.
              </p>
            </Tab>
          </Tabs>
          <br/>
          <br/>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Reporting</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Enter your reason here..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleConfirmReport}>
            Confirm Report
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage;
