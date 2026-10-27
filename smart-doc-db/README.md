# 🚀 Smart Document Processing System - Database Module

Tài liệu này hướng dẫn cách thiết lập và chạy hệ thống **Polyglot Persistence Architecture (MySQL + MongoDB)** cho dự án nhóm.

---

## 📂 Cấu trúc thư mục Database
```text
smart-doc-db/
│
├── docker-compose.yml     # Cấu hình khởi chạy MariaDB & MongoDB qua Docker
├── init.sql               # Script khởi tạo 7 bảng quan hệ trong MySQL
├── seed_mongo.js          # Dữ liệu mẫu (Seed data) cho MongoDB
└── test_connection.js     # Script Node.js kiểm tra kết nối và liên kết 2 Database