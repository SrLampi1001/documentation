---
sidebar_position: 1
---
# CSV File Processing System with MySQL & MongoDB Logging
The following is an example of a project documenation for a multer applicattion, it's made with AI and it's not a tested code, ONLY for reference purporses
- Except it to be replaced soon for a real tested project (assignment simulacre)

## Table of Contents
- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Core Components](#core-components)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Database Schemas](#database-schemas)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project is a learning assignment that demonstrates file upload and processing capabilities using Node.js. The system accepts CSV file uploads via HTTP endpoints, parses the data, stores it in MySQL, and logs all database operations to MongoDB.

**Key Features:**
- Upload CSV files through REST API
- Parse CSV data efficiently
- Dynamic MySQL table creation
- Automatic data insertion
- MongoDB-based operation logging
- Error tracking and monitoring

---

## Technologies Used

### Core Technologies

#### 1. **Express.js**
- Web framework for Node.js
- Handles HTTP routing and middleware
- Version: `^4.18.0` (recommended)

#### 2. **Multer**
- Middleware for handling `multipart/form-data`
- Used for file uploads
- Supports memory and disk storage

#### 3. **csv-parse**
- CSV parsing library
- Transforms CSV into JavaScript objects
- Supports streaming and callbacks

#### 4. **mysql2 (Promises)**
- MySQL client for Node.js
- Promise-based API
- Better performance than legacy mysql package

#### 5. **MongoDB (with Mongoose/Native Driver)**
- NoSQL database for logging
- Stores query execution logs
- Flexible document structure

#### 6. **fs (File System)**
- Native Node.js module
- Read/write file operations
- Works with Multer for file handling

---

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /upload (CSV file)
       ▼
┌─────────────────┐
│  Express API    │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Multer  │ (File Upload Handler)
    └────┬────┘
         │
    ┌────▼────────┐
    │  csv-parse  │ (Parse CSV Data)
    └────┬────────┘
         │
    ┌────▼────────┐
    │   MySQL2    │ (Store Data)
    └────┬────────┘
         │
    ┌────▼────────┐
    │  MongoDB    │ (Log Operations)
    └─────────────┘
```

---

## Prerequisites

Before running this project, ensure you have:

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MySQL**: v5.7 or higher
- **MongoDB**: v4.0 or higher

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/gitsaso-projects/santiago_sanchez_ruiz.git
cd santiago_sanchez_ruiz
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Required Packages

```bash
npm install express multer csv-parse mysql2 mongoose dotenv
```

**Package.json example:**
```json
{
  "name": "csv-processor",
  "version": "1.0.0",
  "description": "CSV file processing with MySQL and MongoDB logging",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "csv-parse": "^5.5.0",
    "mysql2": "^3.6.0",
    "mongoose": "^7.5.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 4. Setup Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=csv_data

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/csv_logs
```

---

## Project Structure

```
santiago_sanchez_ruiz/
├── config/
│   ├── database.js          # Database connections
│   └── multer.js             # Multer configuration
├── controllers/
│   └── uploadController.js   # Upload logic
├── models/
│   └── Log.js                # MongoDB Log model
├── routes/
│   └── upload.js             # API routes
├── utils/
│   ├── csvParser.js          # CSV parsing utilities
│   ├── mysqlHelper.js        # MySQL operations
│   └── logger.js             # MongoDB logger
├── uploads/                  # Temporary file storage
├── .env                      # Environment variables
├── .gitignore
├── index.js                  # Entry point
├── package.json
└── README.md
```

---

## Configuration

### Database Configuration (`config/database.js`)

```javascript
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

// MySQL Connection Pool
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  mysqlPool,
  connectMongoDB
};
```

### Multer Configuration (`config/multer.js`)

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter - Only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed!'), false);
  }
};

// Multer Instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
```

---

## Core Components

### 1. MongoDB Logger (`utils/logger.js`)

```javascript
const mongoose = require('mongoose');

// Log Schema
const logSchema = new mongoose.Schema({
  operation: {
    type: String,
    required: true,
    enum: ['CREATE_TABLE', 'INSERT', 'SELECT', 'UPDATE', 'DELETE']
  },
  query: {
    type: String,
    required: true
  },
  tableName: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    required: true
  },
  rowsAffected: Number,
  error: String,
  executionTime: Number,
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: mongoose.Schema.Types.Mixed
});

const Log = mongoose.model('Log', logSchema);

// Logger Function
async function logQuery(operation, query, tableName, status, details = {}) {
  try {
    const log = new Log({
      operation,
      query,
      tableName,
      status,
      rowsAffected: details.rowsAffected || 0,
      error: details.error || null,
      executionTime: details.executionTime || 0,
      metadata: details.metadata || {}
    });
    
    await log.save();
    console.log(`✓ Logged ${operation} on ${tableName}`);
  } catch (error) {
    console.error('Failed to log to MongoDB:', error);
  }
}

module.exports = { Log, logQuery };
```

### 2. CSV Parser (`utils/csvParser.js`)

```javascript
const fs = require('fs');
const { parse } = require('csv-parse');

/**
 * Parse CSV file and return array of objects
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} Parsed CSV data
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(parse({
        columns: true,          // Use first row as headers
        skip_empty_lines: true, // Skip empty lines
        trim: true,             // Trim whitespace
        cast: true,             // Auto-cast types
        cast_date: false        // Don't auto-cast dates
      }))
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Get column names and infer types from CSV data
 * @param {Array} data - Parsed CSV data
 * @returns {Object} Column definitions
 */
function inferColumnTypes(data) {
  if (!data || data.length === 0) {
    return {};
  }
  
  const columns = {};
  const firstRow = data[0];
  
  for (const [key, value] of Object.entries(firstRow)) {
    // Infer MySQL data type
    if (value === null || value === '') {
      columns[key] = 'VARCHAR(255)';
    } else if (!isNaN(value) && value.indexOf('.') !== -1) {
      columns[key] = 'DECIMAL(10,2)';
    } else if (!isNaN(value)) {
      columns[key] = 'INT';
    } else if (value.length > 255) {
      columns[key] = 'TEXT';
    } else {
      columns[key] = 'VARCHAR(255)';
    }
  }
  
  return columns;
}

module.exports = {
  parseCSV,
  inferColumnTypes
};
```

### 3. MySQL Helper (`utils/mysqlHelper.js`)

```javascript
const { mysqlPool } = require('../config/database');
const { logQuery } = require('./logger');

/**
 * Create table dynamically based on CSV columns
 * @param {string} tableName - Name of table to create
 * @param {Object} columns - Column definitions
 */
async function createTable(tableName, columns) {
  const startTime = Date.now();
  
  // Sanitize table name
  const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');
  
  // Build CREATE TABLE query
  const columnDefs = Object.entries(columns)
    .map(([name, type]) => `\`${name}\` ${type}`)
    .join(', ');
  
  const query = `
    CREATE TABLE IF NOT EXISTS \`${sanitizedTableName}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ${columnDefs},
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    const [result] = await mysqlPool.execute(query);
    const executionTime = Date.now() - startTime;
    
    await logQuery('CREATE_TABLE', query, sanitizedTableName, 'SUCCESS', {
      executionTime,
      metadata: { columns: Object.keys(columns).length }
    });
    
    return { success: true, tableName: sanitizedTableName };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    await logQuery('CREATE_TABLE', query, sanitizedTableName, 'FAILED', {
      error: error.message,
      executionTime
    });
    
    throw error;
  }
}

/**
 * Insert data into MySQL table
 * @param {string} tableName - Target table
 * @param {Array} data - Array of row objects
 */
async function insertData(tableName, data) {
  if (!data || data.length === 0) {
    return { success: true, rowsInserted: 0 };
  }
  
  const startTime = Date.now();
  const columns = Object.keys(data[0]);
  const placeholders = columns.map(() => '?').join(', ');
  
  const query = `
    INSERT INTO \`${tableName}\` (${columns.map(c => `\`${c}\``).join(', ')})
    VALUES (${placeholders})
  `;
  
  let successCount = 0;
  let failCount = 0;
  
  try {
    // Use transaction for bulk insert
    const connection = await mysqlPool.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const row of data) {
        const values = columns.map(col => row[col]);
        await connection.execute(query, values);
        successCount++;
      }
      
      await connection.commit();
      connection.release();
      
      const executionTime = Date.now() - startTime;
      
      await logQuery('INSERT', query, tableName, 'SUCCESS', {
        rowsAffected: successCount,
        executionTime,
        metadata: { totalRows: data.length }
      });
      
      return { success: true, rowsInserted: successCount };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    await logQuery('INSERT', query, tableName, 'FAILED', {
      error: error.message,
      executionTime,
      rowsAffected: successCount
    });
    
    throw error;
  }
}

module.exports = {
  createTable,
  insertData
};
```

### 4. Upload Controller (`controllers/uploadController.js`)

```javascript
const fs = require('fs');
const path = require('path');
const { parseCSV, inferColumnTypes } = require('../utils/csvParser');
const { createTable, insertData } = require('../utils/mysqlHelper');

async function handleCSVUpload(req, res) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const filePath = req.file.path;
    const tableName = req.body.tableName || 
                      path.basename(req.file.originalname, '.csv');
    
    console.log(`Processing CSV file: ${req.file.originalname}`);
    
    // Step 1: Parse CSV
    const data = await parseCSV(filePath);
    console.log(`✓ Parsed ${data.length} rows`);
    
    if (data.length === 0) {
      fs.unlinkSync(filePath); // Clean up
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty'
      });
    }
    
    // Step 2: Infer column types
    const columns = inferColumnTypes(data);
    console.log(`✓ Detected ${Object.keys(columns).length} columns`);
    
    // Step 3: Create table in MySQL
    const tableResult = await createTable(tableName, columns);
    console.log(`✓ Table "${tableResult.tableName}" ready`);
    
    // Step 4: Insert data
    const insertResult = await insertData(tableResult.tableName, data);
    console.log(`✓ Inserted ${insertResult.rowsInserted} rows`);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    // Send response
    res.status(200).json({
      success: true,
      message: 'CSV processed successfully',
      data: {
        tableName: tableResult.tableName,
        rowsProcessed: data.length,
        rowsInserted: insertResult.rowsInserted,
        columns: Object.keys(columns)
      }
    });
    
  } catch (error) {
    console.error('Error processing CSV:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to process CSV',
      error: error.message
    });
  }
}

module.exports = {
  handleCSVUpload
};
```

### 5. Routes (`routes/upload.js`)

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { handleCSVUpload } = require('../controllers/uploadController');

// CSV Upload endpoint
router.post('/upload', upload.single('csvFile'), handleCSVUpload);

// Get logs endpoint (optional)
router.get('/logs', async (req, res) => {
  try {
    const { Log } = require('../utils/logger');
    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

### 6. Main Application File (`index.js`)

```javascript
const express = require('express');
const { connectMongoDB } = require('./config/database');
const uploadRoutes = require('./routes/upload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (if needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.use('/api', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  CSV Processing Server                 ║
║  Status: Running                       ║
║  Port: ${PORT}                         ║
║  MongoDB: Connected                    ║
║  MySQL: Pool Ready                     ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
```

---

## API Endpoints

### POST `/api/upload`

Upload and process a CSV file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `csvFile` (file, required): The CSV file to upload
  - `tableName` (string, optional): Custom table name

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "csvFile=@/path/to/data.csv" \
  -F "tableName=my_custom_table"
```

**Example using JavaScript (Fetch):**
```javascript
const formData = new FormData();
formData.append('csvFile', fileInput.files[0]);
formData.append('tableName', 'products');

fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "CSV processed successfully",
  "data": {
    "tableName": "products",
    "rowsProcessed": 150,
    "rowsInserted": 150,
    "columns": ["id", "name", "price", "category"]
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Failed to process CSV",
  "error": "Detailed error message"
}
```

### GET `/api/logs`

Retrieve recent operation logs from MongoDB.

**Request:**
- Method: `GET`

**Example:**
```bash
curl http://localhost:3000/api/upload/logs
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "logs": [
    {
      "_id": "...",
      "operation": "INSERT",
      "query": "INSERT INTO ...",
      "tableName": "products",
      "status": "SUCCESS",
      "rowsAffected": 150,
      "executionTime": 234,
      "timestamp": "2026-03-02T10:30:00.000Z"
    }
  ]
}
```

---

## Usage Examples

### Example 1: Basic CSV Upload

**Sample CSV file (products.csv):**
```csv
name,price,category,stock
Laptop,999.99,Electronics,45
Mouse,19.99,Electronics,200
Desk,299.00,Furniture,15
Chair,149.50,Furniture,30
```

**Upload:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "csvFile=@products.csv"
```

**Result:**
- Table `products` created in MySQL
- 4 rows inserted
- Operations logged in MongoDB

### Example 2: Using Postman

1. Open Postman
2. Create new POST request to `http://localhost:3000/api/upload`
3. Go to "Body" tab
4. Select "form-data"
5. Add key `csvFile` (change type to File)
6. Select your CSV file
7. (Optional) Add key `tableName` with custom name
8. Click "Send"

### Example 3: HTML Form

```html
<!DOCTYPE html>
<html>
<head>
  <title>CSV Upload</title>
</head>
<body>
  <h1>Upload CSV File</h1>
  
  <form id="uploadForm">
    <label>Table Name:</label>
    <input type="text" id="tableName" placeholder="Optional"><br><br>
    
    <label>CSV File:</label>
    <input type="file" id="csvFile" accept=".csv" required><br><br>
    
    <button type="submit">Upload</button>
  </form>
  
  <div id="result"></div>
  
  <script>
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('csvFile', document.getElementById('csvFile').files[0]);
      
      const tableName = document.getElementById('tableName').value;
      if (tableName) {
        formData.append('tableName', tableName);
      }
      
      try {
        const response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        document.getElementById('result').innerHTML = 
          `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      } catch (error) {
        document.getElementById('result').innerHTML = 
          `<p style="color: red;">Error: ${error.message}</p>`;
      }
    });
  </script>
</body>
</html>
```

---

## Database Schemas

### MySQL (Dynamic)

Tables are created dynamically based on CSV structure. Example:

```sql
CREATE TABLE IF NOT EXISTS `products` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255),
  `price` DECIMAL(10,2),
  `category` VARCHAR(255),
  `stock` INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Log Schema

```javascript
{
  operation: String,      // 'CREATE_TABLE', 'INSERT', etc.
  query: String,          // Actual SQL query
  tableName: String,      // Target table
  status: String,         // 'SUCCESS' or 'FAILED'
  rowsAffected: Number,   // Number of rows affected
  error: String,          // Error message (if failed)
  executionTime: Number,  // Execution time in ms
  timestamp: Date,        // When operation occurred
  metadata: Object        // Additional information
}
```

---

## Error Handling

Common errors and solutions:

### 1. File Upload Errors

**Error:** "Only CSV files are allowed!"
- **Cause:** File is not a CSV
- **Solution:** Ensure file has .csv extension and correct MIME type

**Error:** "File too large"
- **Cause:** File exceeds 5MB limit
- **Solution:** Increase limit in multer config or compress file

### 2. MySQL Errors

**Error:** "ER_ACCESS_DENIED_ERROR"
- **Cause:** Invalid MySQL credentials
- **Solution:** Check .env file credentials

**Error:** "ER_TABLE_EXISTS_ERROR"
- **Cause:** Table already exists
- **Solution:** Use different table name or modify existing table

### 3. MongoDB Errors

**Error:** "MongoNetworkError"
- **Cause:** Cannot connect to MongoDB
- **Solution:** Ensure MongoDB is running: `mongod`

### 4. CSV Parsing Errors

**Error:** "Invalid CSV format"
- **Cause:** Malformed CSV file
- **Solution:** Validate CSV structure, ensure proper encoding (UTF-8)

---

## Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test CSV upload
curl -X POST http://localhost:3000/api/upload \
  -F "csvFile=@test-data.csv"

# View logs
curl http://localhost:3000/api/logs
```

### Sample Test CSV Files

**test-users.csv:**
```csv
firstname,lastname,email,age
John,Doe,john@example.com,30
Jane,Smith,jane@example.com,25
Bob,Johnson,bob@example.com,35
```

**test-sales.csv:**
```csv
date,product,quantity,revenue
2026-01-01,Product A,10,500.00
2026-01-02,Product B,5,250.00
2026-01-03,Product A,8,400.00
```

---

## Troubleshooting

### Issue: Server won't start

**Check:**
1. MongoDB is running: `mongod --version`
2. MySQL is running: `mysql --version`
3. .env file is properly configured
4. Port 3000 is not in use: `lsof -i :3000`

### Issue: File uploads fail

**Check:**
1. `uploads/` directory exists and is writable
2. File size is under limit
3. File is actual CSV format

### Issue: MySQL connection timeout

**Solution:**
```javascript
// Increase timeout in config/database.js
const mysqlPool = mysql.createPool({
  // ... other config
  connectTimeout: 20000,
  acquireTimeout: 20000
});
```

### Issue: MongoDB logs not saving

**Check:**
1. MongoDB connection is established
2. Log model is properly imported
3. Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`

---

## Best Practices

1. **Validate CSV before upload**: Check file size, format, headers
2. **Use transactions**: For data integrity during bulk inserts
3. **Clean up files**: Always delete uploaded files after processing
4. **Index tables**: Add indexes to frequently queried columns
5. **Rate limiting**: Implement to prevent abuse
6. **Sanitize input**: Prevent SQL injection in table/column names
7. **Error logging**: Log all errors for debugging
8. **Backup data**: Regular backups of MySQL and MongoDB

---

## Future Enhancements

- [ ] Add support for Excel files (.xlsx)
- [ ] Implement data validation rules
- [ ] Add user authentication
- [ ] Create dashboard for viewing logs
- [ ] Support for updating existing records
- [ ] Add data transformation rules
- [ ] Implement queuing system for large files
- [ ] Add email notifications on completion
- [ ] Support for multiple database connections
- [ ] Add data preview before import

---

## License

This project is created for educational purposes.

## Author

Santiago Sanchez Ruiz  
GitHub: [@gitsaso-projects](https://github.com/gitsaso-projects)

---

**Happy Learning! 🚀**