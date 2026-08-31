const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { formatTimestamp } = require("../../utils/format.utils");

class AuthService {
    /**
     * Nhận vào 1 đối tượng user được trích xuất từ jwt claims
     * 
     * @param {Object} user 
     * @returns {Promise<Object>} trả về đối tượng chứa success/message/statusCode/userData 
     */
    async loginWithFirebaseAuth(user) {
        try {
            const uid = user.uid;
            const email = user.email || "";
            const name = user.name || "";
            const avatar = user.picture || "";

            const db = admin.firestore();
            const userDoc = await db
                .collection("users")
                .doc(user.uid)
                .get();

            let userData;

            //Tạo mới người dùng
            if (!userDoc.exists) {
                userData = {
                    uid: uid,
                    email: email,
                    displayName: name,
                    avatar: avatar,
                    role: "user",
                    isVip: false,
                    vipExpiryDate: null,
                    createdAt : FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                };

                await userDoc.ref.set(userData);
            } else {
                userData = userDoc.data();
                userData.vipExpiryDate = formatTimestamp(userData.vipExpiryDate);
                userData.createdAt = formatTimestamp(userData.createdAt);
                userData.updatedAt = formatTimestamp(userData.updatedAt);
            }

            return {
                success: true,
                message: "Đăng nhập thành công!",
                statusCode: 200,
                userData: userData,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                statusCode: 500,
                userData: null
            };
        }
    }
}

module.exports = new AuthService();