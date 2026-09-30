require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. CẤU HÌNH DATABASE SQLITE
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE, name TEXT, department TEXT, role TEXT, status TEXT)`);

    // Tạo tài khoản admin mặc định: admin / 123456
    db.get(`SELECT * FROM users WHERE username = 'admin'`, [], async (err, row) => {
        if (!row) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ['admin', hashedPassword, 'Admin']);
        }
    });

    // Tạo dữ liệu mẫu thành viên
    db.get(`SELECT count(*) as count FROM members`, [], (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO members (code, name, department, role, status) VALUES ('SV001', 'Nguyễn Văn A', 'Ban Kỹ Thuật', 'Trưởng ban', 'Hoạt động')`);
            db.run(`INSERT INTO members (code, name, department, role, status) VALUES ('SV002', 'Trần Thị B', 'Ban Truyền Thông', 'Thành viên', 'Hoạt động')`);
        }
    });
});

// 2. MIDDLEWARE XÁC THỰC
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Chưa đăng nhập' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token không hợp lệ' });
        req.user = user;
        next();
    });
};

// 3. API DANG NHAP & QUAN LY THANH VIEN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Tài khoản không tồn tại' });
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(401).json({ error: 'Mật khẩu sai' });
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });
        res.json({ token, username: user.username });
    });
});

app.get('/api/members', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM members`, [], (err, rows) => res.json(rows));
});

app.post('/api/members', authenticateToken, (req, res) => {
    const { code, name, department, role, status } = req.body;
    db.run(`INSERT INTO members (code, name, department, role, status) VALUES (?, ?, ?, ?, ?)`,
        [code, name, department, role, status || 'Hoạt động'],
        function (err) {
            if (err) return res.status(400).json({ error: 'Mã thành viên đã tồn tại' });
            res.json({ id: this.lastID, code, name, department, role, status });
        });
});

app.put('/api/members/:id', authenticateToken, (req, res) => {
    const { name, department, role, status } = req.body;
    db.run(`UPDATE members SET name = ?, department = ?, role = ?, status = ? WHERE id = ?`,
        [name, department, role, status, req.params.id],
        function (err) { res.json({ updated: this.changes }); });
});

app.delete('/api/members/:id', authenticateToken, (req, res) => {
    db.run(`DELETE FROM members WHERE id = ?`, [req.params.id], function (err) {
        res.json({ deleted: this.changes });
    });
});

// 4. API TÍCH HỢP GEMINI AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/ai/plan-event', authenticateToken, async (req, res) => {
    try {
        const { title, budget, description } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Bạn là Trợ lý Quản lý CLB. Hãy lập kế hoạch chi tiết cho sự kiện:\nTên: ${title}\nNgân sách: ${budget || 'Chưa rõ'} VNĐ\nMô tả: ${description || 'Không có'}`;
        const result = await model.generateContent(prompt);
        res.json({ plan: result.response.text() });
    } catch (e) {
        res.status(500).json({ error: 'Lỗi AI hoặc chưa cấu hình GEMINI_API_KEY trong file .env' });
    }
});

app.post('/api/ai/chat', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`Bạn là AI hỗ trợ Quản lý CLB Sinh viên. Trả lời câu hỏi: ${message}`);
        res.json({ reply: result.response.text() });
    } catch (e) {
        res.status(500).json({ error: 'Lỗi AI Chatbot' });
    }
});

// 5. CHẠY SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`Server đã chạy tại: http://localhost:${PORT}`);
    console.log(`=============================================`);
});