const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Xử lý Lập kế hoạch sự kiện bằng AI
exports.planEvent = async (req, res) => {
    try {
        const { title, budget, description } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Vui lòng nhập tên sự kiện!' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Bạn là Trợ lý Quản lý CLB Sinh viên chuyên nghiệp. Hãy lập kế hoạch chi tiết cho sự kiện:
- Tên sự kiện: ${title}
- Dự toán ngân sách: ${budget ? budget + ' VNĐ' : 'Chưa xác định'}
- Mô tả bổ sung: ${description || 'Không có'}

Yêu cầu đầu ra:
1. Mục tiêu sự kiện
2. Timeline chi tiết các bước chuẩn bị & tiến trình
3. Dự toán phân bổ chi phí ngân sách
4. Đề xuất các rủi ro và giải pháp dự phòng`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.json({ plan: responseText });
    } catch (error) {
        console.error('Lỗi Gemini AI Plan:', error);
        res.status(500).json({ error: 'Không thể kết nối Gemini AI. Vui lòng kiểm tra lại GEMINI_API_KEY trong file .env!' });
    }
};

// Xử lý Chatbot tư vấn AI
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống!' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Bạn là Trợ lý AI thân thiện của CLB Sinh viên. Hãy trả lời câu hỏi sau một cách ngắn gọn, hữu ích và lịch sự:
${message}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.json({ reply: responseText });
    } catch (error) {
        console.error('Lỗi Gemini AI Chat:', error);
        res.status(500).json({ error: 'Không thể kết nối với Chatbot AI.' });
    }
};