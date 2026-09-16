class BaseController {
    constructor(service) {
        if (!service) {
            throw new Error("Service không hợp lệ");
        }

        this.service = service;
    }

    /**
     * Controller xử lý tạo mới một document vào Firestore.
     * 
     * @param {import('express').Request} req - Express Request object 
     *  (req.body mong đợi chứa 3 giá trị: { id, createdAt, updatedAt }).
     * @param {import('express').Response} res - Express Response object
     *  dùng để trả kết quả về client.
     * @returns {Promise<Response>} Trả về JSON Response (HTTP Status 201
     *  thành công hoặc 400/500 nếu lỗi).
     */
    create = async (req, res) => {
        try {
            const result = await this.service.create(req.body);
            if (result.success) {
                return res.status(201).json(result);
            }

            return res.status(400).json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                messsage: `Lỗi: ${error.message}`
            });
        }
    }
}

module.exports = BaseController;