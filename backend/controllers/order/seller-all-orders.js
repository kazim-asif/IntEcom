import Order from '../../models/order.js';
import Product from '../../models/product.js';

const getSellerOrders = async (sellerId, orderNumber) => {
  try {
    // Find products that belong to the seller
    const sellerProducts = await Product.find({ user: sellerId }).select('_id');
    const productIds = sellerProducts.map(product => product._id.toString());

    const pageSize = 9;

    const findOrderQuery = {
      ...(orderNumber && {
        orderNumber: { $regex: orderNumber, $options: 'i' }
      }),
      'products.product': { $in: productIds }
     };
     
     const orders = await Order.find(findOrderQuery)
      .populate('user')
      .populate({
         path: 'products.product',
         match: { user: sellerId }
      });

      let totalPages = 0;

    // Map through orders and reconstruct the products array
    const filteredOrders = orders.map(order => {
      const filteredProducts = order.products.filter(p =>
        p.product && productIds.includes(p.product._id.toString())
      );
      
      const totalCount = orders.length
      totalPages = Math.ceil( totalCount / pageSize);

      return {
        ...order.toObject(),
        products: filteredProducts // Replace with the filtered products
      };
    });
    return { status: 200, data: filteredOrders, totalPages:totalPages };
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    throw new Error('An error occurred while fetching orders for the seller.');
  }
};

export default getSellerOrders;
