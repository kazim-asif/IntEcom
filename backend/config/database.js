import AllModels from '../models/all-models.js'

import { connection, connect, set } from 'mongoose';

const { MONGO_URL } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

( async () => {
  const { readyState } = connection;
  if (
    readyState !== 1 || readyState !== 2
  ) {
    set('strictQuery', false)
    await connect(MONGO_URL, options)
      .then(() => {
        console.log('INFO - MongoDB Database connected.');
      })
      .catch(err => console.log('ERROR - Unable to connect to the database:', err));
  }
})();