---
sidebar-position: 2
---
# CSV Upload & Processing System
**Please read notice at the end**
---

## 📋 Table of Contents

1. [Project Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Architecture](#architecture)
4. [Installation & Setup](#installation)
5. [Environment Variables](#env)
6. [Module Breakdown](#modules)
   - [Express — API Server](#express)
   - [Multer — File Upload](#multer)
   - [csv-parse — CSV Parsing](#csv-parse)
   - [MySQL2 — Data Persistence](#mysql2)
   - [MongoDB — Query Logging](#mongodb)
7. [API Endpoints](#endpoints)
8. [Data Flow](#data-flow)
9. [Database Schemas](#schemas)
10. [Error Handling](#errors)

---

## 🧭 1. Project Overview <a name="overview"></a>

This project is an academic assignment designed to demonstrate the integration of multiple backend technologies in a Node.js environment. The system exposes an HTTP API through which users can **upload CSV files**. These files are then **parsed and analyzed**, their data is **stored in a MySQL relational database**, and every database operation is **logged into a MongoDB collection** for auditing and traceability.

### 🎯 Goals

| Goal | Technology Used |
|---|---|
| Expose an HTTP API | Express |
| Accept CSV file uploads | Multer |
| Read & parse CSV content | csv-parse + fs |
| Store structured data | MySQL2 (with Promises) |
| Log all DB operations | MongoDB |

---

## 🛠️ 2. Tech Stack <a name="tech-stack"></a>

| Package | Version (Typical) | Role |
|---|---|---|
| `express` | ^4.x | HTTP server & routing |
| `multer` | ^1.x | Multipart/form-data file handling |
| `csv-parse` | ^5.x | CSV stream parsing |
| `mysql2` | ^3.x | MySQL client with Promise support |
| `mongodb` | ^6.x | NoSQL client for logging |
| `fs` (built-in) | Node.js core | File system access |
| `dotenv` | ^16.x | Environment variable management |

---

## 🏗️ 3. Project Architecture <a name="architecture"></a>

```
project/
│
├── src/
│   ├── config/
│   │   ├── mysql.js          # MySQL connection pool setup
│   │   └── mongodb.js        # MongoDB client setup
│   │
│   ├── routes/
│   │   └── upload.routes.js  # Express router for /upload endpoint
│   │
│   ├── controllers/
│   │   └── upload.controller.js  # Business logic handler
│   │
│   ├── services/
│   │   ├── csv.service.js    # CSV parsing logic (csv-parse + fs)
│   │   ├── mysql.service.js  # MySQL table creation & data insertion
│   │   └── mongo.service.js  # MongoDB logging service
│   │
│   └── middlewares/
│       └── multer.middleware.js  # Multer configuration
│
├── uploads/                  # Temporary storage for uploaded CSV files
├── .env                      # Environment variables
├── .gitignore
├── package.json
└── index.js                  # Entry point
```

---

## ⚙️ 4. Installation & Setup <a name="installation"></a>

### Prerequisites

- **Node.js** v18+
- **MySQL** server running locally or remotely
- **MongoDB** server running locally or remotely (or MongoDB Atlas)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/user/example_project.git
cd example_project

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Then fill in your credentials (see Environment Variables section)

# 4. Start the server
node index.js
# or with nodemon for development:
npx nodemon index.js
```

---

## 🔐 5. Environment Variables <a name="env"></a>

Create a `.env` file at the root of the project with the following variables:

```env
# Server
PORT=3000

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=csv_db

# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=csv_logs
```

---

## 🧩 6. Module Breakdown <a name="modules"></a>

---

### 🚀 Express — API Server <a name="express"></a>

Express is the backbone of the application. It initializes the HTTP server, registers middleware, and defines the routing structure.

```js
// index.js
const express = require('express');
const uploadRoutes = require('./src/routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Key Concepts:**
- `express()` creates the app instance.
- `app.use()` mounts middleware and routers.
- `app.listen()` starts the HTTP server on the configured port.

---

### 📁 Multer — File Upload <a name="multer"></a>

Multer handles `multipart/form-data`, which is the encoding type used when submitting files through forms or API clients (like Postman).

```js
// src/middlewares/multer.middleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save temporarily to /uploads
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
```

**Key Concepts:**
- `diskStorage` saves the file to disk so `fs` can read it afterward.
- `fileFilter` rejects any non-CSV file before it reaches the controller.
- The file is temporarily stored in the `uploads/` directory.

---

### 📊 csv-parse — CSV Parsing <a name="csv-parse"></a>

`csv-parse` reads the uploaded file using Node's `fs` module and parses each row into a JavaScript object.

```js
// src/services/csv.service.js
const fs = require('fs');
const { parse } = require('csv-parse');

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const records = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true,      // Use first row as header keys
          skip_empty_lines: true,
          trim: true
        })
      )
      .on('data', (row) => {
        records.push(row);
      })
      .on('end', () => {
        // Clean up the temporary file after parsing
        fs.unlinkSync(filePath);
        resolve(records);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

module.exports = { parseCSV };
```

**Key Concepts:**
- `fs.createReadStream()` reads the file as a stream (memory-efficient).
- `.pipe(parse({...}))` feeds the stream into the CSV parser.
- `columns: true` maps each row to an object using the header row as keys.
- After parsing, `fs.unlinkSync()` removes the temp file to keep the server clean.

---

### 🗄️ MySQL2 — Data Persistence <a name="mysql2"></a>

`mysql2` with Promises is used to create tables dynamically (if they don't exist) based on the CSV headers, and to insert each parsed row as a record.

```js
// src/config/mysql.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
```

```js
// src/services/mysql.service.js
const pool = require('../config/mysql');

const createTableFromHeaders = async (tableName, headers) => {
  const columns = headers.map(h => `\`${h}\` VARCHAR(255)`).join(', ');
  const query = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ${columns}
  )`;
  await pool.query(query);
  return query;
};

const insertRows = async (tableName, rows) => {
  const queries = [];
  for (const row of rows) {
    const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
    const values = Object.values(row);
    const placeholders = values.map(() => '?').join(', ');
    const query = `INSERT INTO \`${tableName}\` (${keys}) VALUES (${placeholders})`;
    await pool.query(query, values);
    queries.push(query);
  }
  return queries;
};

module.exports = { createTableFromHeaders, insertRows };
```

**Key Concepts:**
- `mysql2/promise` enables `async/await` syntax for all queries.
- `createPool()` manages a pool of reusable connections for efficiency.
- The table is named dynamically (e.g., from the CSV filename).
- `CREATE TABLE IF NOT EXISTS` prevents errors on repeated uploads.
- Parameterized queries (`?` placeholders) prevent SQL injection.

---

### 🍃 MongoDB — Query Logging <a name="mongodb"></a>

Every MySQL query executed (CREATE TABLE, INSERT) is logged as a document in MongoDB, providing a full audit trail.

```js
// src/config/mongodb.js
const { MongoClient } = require('mongodb');

let db;

const connectMongo = async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME);
  console.log('MongoDB connected');
};

const getDb = () => db;

module.exports = { connectMongo, getDb };
```

```js
// src/services/mongo.service.js
const { getDb } = require('../config/mongodb');

const logQuery = async (queryType, query, status, error = null) => {
  const db = getDb();
  await db.collection('query_logs').insertOne({
    queryType,       // e.g., 'CREATE_TABLE' or 'INSERT'
    query,           // The raw SQL string executed
    status,          // 'SUCCESS' or 'ERROR'
    error,           // Error message if applicable
    timestamp: new Date()
  });
};

module.exports = { logQuery };
```

**Key Concepts:**
- Each log document stores the SQL query, its type, result status, and timestamp.
- Logs are stored in a `query_logs` collection inside the configured database.
- This provides full traceability of what data was inserted and when.

---

## 🔌 7. API Endpoints <a name="endpoints"></a>

### `POST /api/upload`

Uploads a CSV file, parses it, stores data in MySQL, and logs all operations to MongoDB.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/upload` |
| **Content-Type** | `multipart/form-data` |
| **Field Name** | `file` |
| **Accepted Types** | `.csv` only |

#### ✅ Success Response (`200 OK`)
```json
{
  "message": "File processed successfully",
  "rowsInserted": 25,
  "table": "data_1718000000000"
}
```

#### ❌ Error Response (`400 / 500`)
```json
{
  "error": "Only CSV files are allowed"
}
```

#### 📬 Example using cURL
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/your/file.csv"
```

#### 📬 Example using Postman
1. Set method to `POST`
2. URL: `http://localhost:3000/api/upload`
3. Go to **Body** → **form-data**
4. Add key `file`, change type to **File**, and select your CSV

---

## 🔄 8. Data Flow <a name="data-flow"></a>

```
Client (Postman / Frontend)
        │
        │  POST /api/upload  (multipart/form-data)
        ▼
  [ Express Router ]
        │
        ▼
  [ Multer Middleware ]
   Saves file to /uploads/
        │
        ▼
  [ Upload Controller ]
        │
        ├──▶ [ csv.service ]
        │      fs.createReadStream() + csv-parse
        │      Returns: Array of row objects
        │
        ├──▶ [ mysql.service ]
        │      CREATE TABLE IF NOT EXISTS (based on CSV headers)
        │      INSERT INTO ... (one per row)
        │         │
        │         ▼
        │    [ MySQL Database ]
        │
        └──▶ [ mongo.service ]
               Logs each SQL query with status + timestamp
                  │
                  ▼
             [ MongoDB Collection: query_logs ]
```

---

## 🗃️ 9. Database Schemas <a name="schemas"></a>

### MySQL — Dynamic Table (example from a `users.csv`)

```sql
CREATE TABLE IF NOT EXISTS `data_1718000000000` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255),
  `email` VARCHAR(255),
  `age` VARCHAR(255)
);
```
> Column names and count are determined at runtime from the CSV headers.

### MongoDB — `query_logs` Collection

```json
{
  "_id": "ObjectId(...)",
  "queryType": "INSERT",
  "query": "INSERT INTO `data_1718000000000` (`name`, `email`, `age`) VALUES (?, ?, ?)",
  "status": "SUCCESS",
  "error": null,
  "timestamp": "2025-06-10T14:35:22.000Z"
}
```

---

## ⚠️ 10. Error Handling <a name="errors"></a>

| Scenario | Response | HTTP Code |
|---|---|---|
| No file uploaded | `"No file provided"` | `400` |
| Non-CSV file uploaded | `"Only CSV files are allowed"` | `400` |
| Empty CSV file | `"CSV file is empty"` | `400` |
| MySQL connection failure | `"Database connection error"` | `500` |
| MongoDB connection failure | `"Logging service unavailable"` | `500` |
| Malformed CSV | `"Failed to parse CSV"` | `500` |

---

## 📦 `package.json` (Reference)

```json
{
  "name": "example_project",
  "version": "1.0.0",
  "description": "CSV upload and processing system using Express, Multer, csv-parse, MySQL2 and MongoDB",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "csv-parse": "^5.5.0",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "mongodb": "^6.0.0",
    "multer": "^1.4.5",
    "mysql2": "^3.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

---

> 📌 **Disclaimer:** This documentation was AI generated based on the described technologies and system design, the code isn't tested and it's not recommended to implement. This documentation can be updated to reflect the actual code structure and implementation details of a real assignment.