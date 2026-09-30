# Kiến Trúc Hệ Thống Quản Lý CLB Sinh Viên (Student Club Management System)

Dự án được xây dựng theo kiến trúc MVC (Model-View-Controller) đơn giản, phục vụ việc quản lý thành viên và tích hợp AI Gemini hỗ trợ lập kế hoạch & tư vấn.

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

- **Backend**: Node.js, Express.js
- **Database**: SQLite / In-memory JSON Data
- **Authentication**: JWT (JSON Web Token)
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai` - Gemini 1.5 Flash)
- **Frontend**: Single Page Application (SPA) - HTML5, CSS3, Bootstrap 5, FontAwesome, JavaScript Vanilla

---

## 2. Cấu Trúc Thư Mục (Directory Structure)

```text
code nhóm 24/
├── config/
│   └── database.js       # Khởi tạo & chứa dữ liệu giả lập (Users, Members)
├── controllers/
│   ├── aiController.js    # Xử lý logic kết nối Gemini AI (Plan Event, Chatbot)
│   ├── authController.js  # Xử lý đăng nhập & cấp phát Token JWT
│   └── memberController.js# Xử lý CRUD danh sách thành viên
├── docs/
│   └── ARCHITECTURE.md   # Tài liệu kiến trúc hệ thống
├── prompts/
│   └── aiPrompts.js      # Lưu trữ các mẫu Prompt cấu hình cho AI
├── public/
│   └── index.html        # Giao diện Single Page Application (Dashboard)
├── routes/
│   └── api.js            # Định nghĩa các Endpoint API & Middleware xác thực
├── .env                  # Lưu trữ biến môi trường (PORT, JWT_SECRET, GEMINI_API_KEY)
├── .env.example          # File mẫu biến môi trường
├── package.json          # Quản lý dependencies
└── server.js             # Entry point khởi chạy HTTP Server