// Database giả lập (In-memory Database)

const users = [
    {
        id: 1,
        username: "admin",
        password: "123", // Mật khẩu mặc định
        role: "admin"
    }
];

const members = [
    {
        id: 1,
        code: "SV001",
        name: "Đặng Ngọc Huy",
        department: "Ban Kỹ Thuật",
        role: "Trưởng Ban",
        status: "Hoạt động"
    },
    {
        id: 2,
        code: "SV002",
        name: "Nguyễn Khánh Duy",
        department: "Ban Truyền Thông",
        role: "Thành viên",
        status: "Hoạt động"
    },
    {
        id: 3,
        code: "SV003",
        name: "Lê Văn C",
        department: "Ban Sự Kiện",
        role: "Thành viên",
        status: "Hoạt động"
    }
];

module.exports = {
    users,
    members
};