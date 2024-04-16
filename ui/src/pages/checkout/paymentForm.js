import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Form, Button, Container, Row, Col, InputGroup, CloseButton } from 'react-bootstrap';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector'; // Import CountryDropdown and RegionDropdown
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';// Import PhoneInput
import 'react-phone-number-input/style.css'; // Import CSS for PhoneInput
import './PaymentForm.css';
import { useNavigate } from 'react-router-dom';
import countryCodeLookup from 'country-code-lookup'; // Import the country-code-lookup library
import AlertComp from '../../components/alert';

//redux
import { remove, increase, decrease, placeOrder } from '../../redux/slice/cart/cart-slice';
import { useDispatch, useSelector } from 'react-redux';

const PaymentForm = ({ user, total, cartItems, setShowPaymentForm }) => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phoneNumber: '',
    });

    const [validated, setValidated] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderError, setOrderError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState([]); // State dropdown options

    useEffect(() => {
        if (shippingInfo.country) {
            // Fetch states based on the selected country
            axios.get(`https://api.first.org/data/v1/${shippingInfo.country.toLowerCase()}/regions`)
                .then(response => {
                    const statesData = response.data.regions.map(region => region.name);
                    setStates(statesData);
                })
                .catch(error => {
                    console.error('Error fetching states:', error);
                });
        }
    }, [shippingInfo.country]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setShippingInfo({ ...shippingInfo, [name]: value });
    };

    const handleCountryChange = (val) => {
        // Map the full country name to its two-letter country code
        const code = countryCodeLookup.byCountry(val);
        if (code) {
            setShippingInfo({ ...shippingInfo, country: code.iso2 });
        }
    };

    const handlePhoneChange = (value) => {
        setShippingInfo({ ...shippingInfo, phoneNumber: value });
    };

    const handlePaymentSubmit = async (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        setValidated(true);
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        // Replace with your backend endpoint
        const paymentIntentEndpoint = `${process.env.REACT_APP_DEV_BACKEND_URL}/orders/create-payment-intent`;

        try {
            const amountInCents = Math.round(total * 100);

            const { data } = await axios.post(paymentIntentEndpoint, {
                amount: amountInCents,
                currency: 'usd',
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const cardElement = elements.getElement(CardElement);
            const paymentResult = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: shippingInfo.name,
                        address: {
                            line1: shippingInfo.address,
                            city: shippingInfo.city,
                            state: shippingInfo.state,
                            postal_code: shippingInfo.zip,
                            country: shippingInfo.country,
                        },
                        phone: shippingInfo.phoneNumber,
                    },
                },
            });

            if (paymentResult.error) {
                setOrderError(true);
                setErrorText(paymentResult.error.message);
            } else {
                console.log('Payment successful!', paymentResult);

                try {
                    const products = cartItems.map((product) => ({
                        product: product._id,
                        quantity: product.orderQuantity,
                    }));
                    const ProductsforReceipt = cartItems.map((product) => ({
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: product.orderQuantity,
                    }));

                    const orderSuccessful = dispatch(
                        placeOrder(products, total, user.token, shippingInfo, 'Paid')
                    );
                    if (orderSuccessful) {
                        setOrderPlaced(true);
                        setOrderError(false);
                        setErrorText('');

                        navigate('/order-confirm', {
                            state: {
                                shippingInfo,
                                products: ProductsforReceipt,
                                total,
                                phone: shippingInfo.phoneNumber,
                            }
                        });
                        setTimeout(() => {
                            setLoading(false);
                        }, 1000);
                    } else {
                        setOrderError(true);
                        setErrorText('Error occurred in placing the order');
                        setOrderPlaced(false);
                        setTimeout(() => {
                            setLoading(false);
                        }, 1000);
                    }
                } catch (error) {
                    setOrderError(true);
                    setErrorText(error.message || 'Order Placement error');
                }
            }
        } catch (error) {
            setOrderError(true);
            setErrorText(error.message || 'Payment error');
        }
    };

    const styles = {
        paymentFormSlide: {
            padding: '2rem',
            backgroundColor: '#f7f7f7',
        },
        header: {
            marginBottom: '1rem',
        },
        heading: {
            color: '#0d6efd',
            marginBottom: '1rem',
        },
        closeButton: {
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '0.3rem',
        },
        form: {
            backgroundColor: 'white',
            padding: '2rem',
        },
        fieldset: {
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: '0.3rem',
        },
        legend: {
            width: 'auto',
            paddingBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#495057',
        },
        confirmButton: {
            width: '100%',
            padding: '0.34rem',
            // fontSize: '1.2rem',
            fontWeight:'semibold',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '0.3rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
    };

    return (
        <div className="payment-form-slide" style={styles.paymentFormSlide}>
            <Container>
                <div className="d-flex justify-content-between align-items-center" style={styles.header}>
                    <h2 style={styles.heading}>Shipping and Payment</h2>
                    <CloseButton onClick={() => setShowPaymentForm(false)} aria-label="Hide" />
                </div>
                <Form onSubmit={handlePaymentSubmit} style={styles.form} noValidate validated={validated}>
                    <fieldset style={styles.fieldset}>
                        <legend style={styles.legend}>Shipping Details</legend>
                        <Form.Group as={Row} className="mb-3" controlId="validationCustom01">
                            <Form.Label column sm={2}>Name</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="text" name="name" onChange={handleInputChange} required />
                                <Form.Control.Feedback type="invalid">
                                    Please enter your name.
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="validationCustom07">
                            <Form.Label column sm={2}>Phone Number</Form.Label>
                            <Col sm={10}>
                                <PhoneInput
                                    international
                                    defaultCountry="US"
                                    value={shippingInfo.phoneNumber}
                                    onChange={handlePhoneChange}
                                />
                                {!isValidPhoneNumber(shippingInfo.phoneNumber) && (
                                    <Form.Text className="text-danger">Invalid phone number</Form.Text>
                                )}
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="validationCustom02">
                            <Form.Label column sm={2}>Address</Form.Label>
                            <Col sm={10}>
                                <Form.Control
                                    as="textarea"
                                    name="address"
                                    onChange={handleInputChange}
                                    rows={3}  // You can adjust the number of rows depending on your needs
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Please enter your address.
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="validationCustom03">
                            <Form.Label column sm={2}>City</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="text" name="city" onChange={handleInputChange} required />
                                <Form.Control.Feedback type="invalid">
                                    Please enter your city.
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="validationCustom04">
                            <Form.Label column sm={2}>State</Form.Label>
                            <Col sm={10}>
                                <RegionDropdown
                                    country={shippingInfo.country}
                                    value={shippingInfo.state}
                                    onChange={(val) => setShippingInfo({ ...shippingInfo, state: val })}
                                    classes="form-control"
                                    blankOptionLabel="Select State"
                                    disableWhenEmpty={true}
                                >
                                    {states.map((state, index) => (
                                        <option key={index} value={state}>{state}</option>
                                    ))}
                                </RegionDropdown>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="validationCustom05">
                            <Form.Label column sm={2}>Postal Code</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="text" name="zip" onChange={handleInputChange} required />
                                <Form.Control.Feedback type="invalid">
                                    Please enter your postal code.
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3" controlId="validationCustom06">
                            <Form.Label column sm={2}>Country</Form.Label>
                            <Col sm={10}>
                                <CountryDropdown
                                    value={shippingInfo.country}
                                    onChange={handleCountryChange}
                                    classes="form-control"
                                    valueType="full"
                                />
                            </Col>
                        </Form.Group>
                        {/* Other form fields */}
                    </fieldset>
                    {/* Payment Details */}
                    <fieldset style={styles.fieldset}>
                        <legend style={styles.legend}>Payment Details</legend>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Card Information</Form.Label>
                            <Col sm={10}>
                                <InputGroup>
                                    <CardElement className="form-control" />
                                </InputGroup>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={2}>Name on Card</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="text" name="Name on Card" onChange={handleInputChange} required />
                                <Form.Control.Feedback type="invalid">
                                    Please enter the name on card.
                                </Form.Control.Feedback>
                            </Col>
                        </Form.Group>

                    </fieldset>
                    <Button type="submit" style={styles.confirmButton} disabled={!stripe}>
                        Confirm Payment
                    </Button>
                </Form>
                {orderPlaced && (
                    <AlertComp variant="success" text="Awesome, Your order has been placed successfully." onClose={() => setOrderPlaced(false)} />
                )}
                {orderError && (
                    <AlertComp variant="danger" text={errorText} onClose={() => setOrderError(false)} />
                )}
            </Container>
        </div>
    );
};

export default PaymentForm;