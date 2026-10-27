const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Kết nối MySQL Connection Pool
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3307,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'rootpassword',
  database: process.env.MYSQL_DATABASE || 'smart_doc_db',
  waitForConnections: true,
  connectionLimit: 10,
});

// 2. Kết nối MongoDB
const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://mongoadmin:mongopassword@localhost:27017/smart_doc_mongo_db?authSource=admin';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

// 3. Định nghĩa Schema MongoDB (Chuẩn theo Figure 4.5 & Table 4.1 trong báo cáo)
const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  line_amount: { type: Number, required: true }
}, { _id: false });

const InvoicePayloadSchema = new mongoose.Schema({
  job_id: { type: Number, required: true, index: true }, // FK trỏ về Processing_Job.job_id bên MySQL
  raw_llm_output: { type: String, required: true },
  created_at: { type: Date, default: Date.now, required: true },
  normalized_data: {
    invoice_number: { type: String },
    invoice_date: { type: Date },
    supplier_name: { type: String },
    subtotal: { type: Number },
    tax: { type: Number },
    total: { type: Number },
    Invoice_Item: { type: [InvoiceItemSchema], required: true }
  },
  confidence_scores: {
    overall: { type: Number, required: true },
    invoice_number: { type: Number },
    total: { type: Number },
    items: { type: Number }
  }
}, { collection: 'Invoice_payloads' });

const InvoicePayload = mongoose.models.InvoicePayload || mongoose.model('InvoicePayload', InvoicePayloadSchema);

module.exports = { mysqlPool, connectMongoDB, InvoicePayload };