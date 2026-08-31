const authService = require("../../services/auth/auth.service");

class AuthController {
    //Hàm này sẽ có middleware bóc tách jwt từ header để lấy ra claim bên trong
    async loginWithFirebaseAuth(req, res) {
        try {
            const user = req.user;
            if (!user)
                throw new Error("Không tìm thấy thông tin người dùng");

            const result = await authService.loginWithFirebaseAuth(user);

            return res.status(result.statusCode).json({
                success: result.success,
                message: result.message,
                userData: result.userData
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                userData: null
            });
        }
    }
}

module.exports = new AuthController();