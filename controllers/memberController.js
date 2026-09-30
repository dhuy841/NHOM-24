const db = require('../config/database');

exports.getMembers = (req, res) => {
    db.all(`SELECT * FROM members`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.addMember = (req, res) => {
    const { code, name, department, role, status } = req.body;
    db.run(`INSERT INTO members (code, name, department, role, status) VALUES (?, ?, ?, ?, ?)`,
        [code, name, department, role, status || 'Hoạt động'],
        function (err) {
            if (err) return res.status(400).json({ error: 'Mã sinh viên đã tồn tại hoặc dữ liệu lỗi' });
            res.json({ id: this.lastID, code, name, department, role, status: status || 'Hoạt động' });
        });
};

exports.updateMember = (req, res) => {
    const { name, department, role, status } = req.body;
    db.run(`UPDATE members SET name = ?, department = ?, role = ?, status = ? WHERE id = ?`,
        [name, department, role, status, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
};

exports.deleteMember = (req, res) => {
    db.run(`DELETE FROM members WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
};