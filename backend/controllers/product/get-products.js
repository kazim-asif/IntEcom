// import Product from '../../models/product.js';
// import axios from 'axios';
// import 'dotenv/config.js'

// // getting environment variable
// const {Flask_URL}= process.env

// const getProducts = async ({ query, catagory, isSaleOnly }) => {
//   try {
//     const sortOrder = query.sort;
//     if (sortOrder && sortOrder !== 'asc' && sortOrder !== 'desc') {
//       return { status: 400, data: { error: 'Invalid sort order. Use "asc" or "desc".' } };
//     }

//     const page = parseInt(query.page) || 1;
//     const pageSize = parseInt(query.size) || 8;
//     const queryName = query.name;
//     const sortField = 'price';
//     const sortOptions = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
    
//     const response = await axios.get(`${Flask_URL}/search`, { params: { prod: queryName } });
//     const foundProducts = response.data.products
    
//     // Filter out null items from the category array
// 	const filteredCategory = catagory.filter(item => item !== null);

// 	// Prepare the base query object
// 	const baseQuery = {
// 		isDeleted: false,
// 		status: { $ne: 'blocked' },
// 		$or: [
// 			{ uid: { $in: foundProducts } }
// 		]
// 	};

// 	// Define the findQuery based on conditions
// 	let findQuery;

// 	if (isSaleOnly) {
// 		findQuery = {
// 			...baseQuery,
// 			isOnSale: true,
// 			...(filteredCategory.length !== 0 ? { category: { $in: filteredCategory } } : {})
// 		};
// 	} else {
// 		findQuery = {
// 			...baseQuery,
// 			...(filteredCategory.length !== 0 ? { category: { $in: filteredCategory } } : {})
// 		};
// 	}

    

    // Update findQuery to exclude blocked products
    // const findQuery = {
    //   isDeleted: false,
    //   status: { $ne: 'blocked' }, // Exclude blocked products
    //   ...(queryName && {
    //     $or: [
    //       { name: { $regex: queryName, $options: 'i' } },
    //       { description: { $regex: queryName, $options: 'i' } },
    //     ],
    //   }),
    // };

//     const totalCount = await Product.countDocuments(findQuery);
//     const totalPages = Math.ceil(totalCount / pageSize);

//     const products = await Product.find(findQuery)
//       .sort(sortOptions)
//       .skip((page - 1) * pageSize)
//       .limit(pageSize);
//     return { status: 200, data: { totalPages, data: products } };
//   } catch (error) {
//     console.error('Error while fetching products:', error);
//     throw new Error('Internal server error.');
//   }
// };

// export default getProducts;



























import Product from '../../models/product.js';
import axios from 'axios';
import 'dotenv/config.js'

// getting environment variable
const {Flask_URL}= process.env

const getProducts = async ({ query, catagory, isSaleOnly }) => {
  try {
    const sortOrder = query.sort;
    if (sortOrder && sortOrder !== 'asc' && sortOrder !== 'desc') {
      return { status: 400, data: { error: 'Invalid sort order. Use "asc" or "desc".' } };
    }

    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.size) || 8;
    const queryName = query.name;
    const sortField = 'price';
    const sortOptions = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
    let newArray 
    if (catagory.length!==0) {
      newArray = catagory.filter(item => item !== null);

    }

    const response = await axios.get(`${Flask_URL}/search`, { params: { prod: queryName } });
    const foundProducts = response.data.products
    let findQuery
    if (isSaleOnly) {
      if (catagory.length!==0) {
        if (newArray.length!==0) {
          findQuery = {
            isDeleted: false,
            status: { $ne: 'blocked' },
            isOnSale: true,
            catagory: { $in: newArray },
            $or: [
              { uid: { $in: foundProducts } },
            ]
          };
        }else{
          findQuery = {
            isDeleted: false,
            status: { $ne: 'blocked' },
            isOnSale: true,
            $or: [
              { uid: { $in: foundProducts } },
            ]
          };
        }
        
      }else{
          findQuery = {
            isDeleted: false,
            status: { $ne: 'blocked' },
            isOnSale: true,
            $or: [
              { uid: { $in: foundProducts } },
            ]
          };
        }
    }
    else{
      if (catagory.length!==0) {
        if (newArray.length!==0) {
          findQuery = {
            isDeleted: false,
            status: { $ne: 'blocked' },
            catagory: { $in: newArray },
            $or: [
              { uid: { $in: foundProducts } },
            ]
          };
        }else{
          findQuery = {
            isDeleted: false,
            status: { $ne: 'blocked' },
            $or: [
              { uid: { $in: foundProducts } },
            ]
          };
        }
        
      }else{
          findQuery = {
            isDeleted: false,
            status: { $ne: 'blocked' },
            $or: [
              { uid: { $in: foundProducts } },
            ]
          };
        }
    }
    

    // Update findQuery to exclude blocked products
    // const findQuery = {
    //   isDeleted: false,
    //   status: { $ne: 'blocked' }, // Exclude blocked products
    //   ...(queryName && {
    //     $or: [
    //       { name: { $regex: queryName, $options: 'i' } },
    //       { description: { $regex: queryName, $options: 'i' } },
    //     ],
    //   }),
    // };

    const totalCount = await Product.countDocuments(findQuery);
    const totalPages = Math.ceil(totalCount / pageSize);

    const products = await Product.find(findQuery)
      .sort(sortOptions)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return { status: 200, data: { totalPages, data: products } };
  } catch (error) {
    console.error('Error while fetching products:', error);
    throw new Error('Internal server error.');
  }
};

export default getProducts;
