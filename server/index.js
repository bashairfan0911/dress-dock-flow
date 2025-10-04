require('dotenv').config();
const app = require('./app');
const connectDB = require('./db');

const port = process.env.PORT || 3002;

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});