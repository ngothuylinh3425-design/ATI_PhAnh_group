const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

async function testPolyglotDatabase() {
  console.log('🚀 Đang kiểm tra kết nối hệ thống Polyglot Database...\n');

  try {
    // 1. Kết nối tới MySQL (MariaDB ở port 3307)
    const mysqlConn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'root',
      password: 'rootpassword',
      database: 'smart_doc_db'
    });
    console.log('✅ 1. Kết nối MySQL (smart_doc_db) THÀNH CÔNG!');

    // 2. Kết nối tới MongoDB (ở port 27017)
    const mongoUri = 'mongodb://mongoadmin:mongopassword@127.0.0.1:27017/smart_doc_mongo_db?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ 2. Kết nối MongoDB (smart_doc_mongo_db) THÀNH CÔNG!\n');

    // 3. Truy vấn thử dữ liệu từ MySQL (Kết hợp bảng Processing_Job, Document, User và Model_Configuration)
    const [jobs] = await mysqlConn.execute(`
      SELECT
        j.job_id, j.status, j.agreement_score, j.mongo_payload_id,
        d.file_name, u.name AS uploaded_by, m.model_name
      FROM Processing_Job j
      JOIN Document d ON j.document_id = d.document_id
      JOIN User u ON d.user_id = u.user_id
      JOIN Model_Configuration m ON j.configuration_id = m.configuration_id
    `);

    console.log(`📊 Tìm thấy ${jobs.length} Processing Jobs trong MySQL. Đang lấy dữ liệu JSON tương ứng từ MongoDB...\n`);
    console.log('=========================================================================');

    // 4. Dùng mongo_payload_id từ MySQL để móc sang Collection Invoice_payloads của MongoDB
    const db = mongoose.connection.db;
    const collection = db.collection('Invoice_payloads');

    for (const job of jobs) {
      console.log(`🔹 JOB ID: #${job.job_id} | Trạng thái: [${job.status.toUpperCase()}]`);
      console.log(`   - File tải lên : ${job.file_name} (Bởi: ${job.uploaded_by})`);
      console.log(`   - Model xử lý  : ${job.model_name} | Điểm đồng thuận: ${job.agreement_score}`);
      console.log(`   - Mã liên kết MongoDB (mongo_payload_id): ${job.mongo_payload_id}`);

      // Tìm bản ghi JSON trong MongoDB bằng _id
      const mongoDoc = await collection.findOne({
        _id: new mongoose.Types.ObjectId(job.mongo_payload_id)
      });

      if (mongoDoc) {
        console.log(`   👉 DỮ LIỆU JSON TRÍCH XUẤT TỪ MONGODB:`);
        console.log(`      + Nhà cung cấp : ${mongoDoc.normalized_data.supplier_name}`);
        console.log(`      + Số hóa đơn   : ${mongoDoc.normalized_data.invoice_number}`);
        console.log(`      + Tổng tiền    : $${mongoDoc.normalized_data.total} (Subtotal: $${mongoDoc.normalized_data.subtotal}, Tax: $${mongoDoc.normalized_data.tax})`);
        console.log(`      + Độ tin cậy AI: ${mongoDoc.confidence_scores.overall * 100}%`);
      } else {
        console.log(`   ⚠️ Không tìm thấy bản ghi JSON trong MongoDB!`);
      }
      console.log('=========================================================================');
    }

    // Đóng kết nối sau khi test xong
    await mysqlConn.end();
    await mongoose.disconnect();
    console.log('\n🎉 HOÀN TẤT KIỂM TRA! Cả 2 Database đã liên kết hoàn hảo, sẵn sàng tích hợp vào Backend/Frontend!');

  } catch (error) {
    console.error('❌ Có lỗi xảy ra:', error);
  }
}

testPolyglotDatabase();