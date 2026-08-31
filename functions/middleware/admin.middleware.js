//Kiểm tra role admin, gọi sau authMiddleware để lấy custom claims check
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Từ chối truy cập!",
            });
        }

        return next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Hệ thống xảy ra lỗi!",
        });
    }
};

module.exports = {
    requireAdmin,
};
