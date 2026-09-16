const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");
const { strIso8601ToTimestamp } = require("../../utils/convert.utils");

class BaseService {
    constructor(nameCollect) {
        this.nameCollect = nameCollect;
    }

    create = async (payload) => {
        try {
            const { id, createdAt, updatedAt, ...restPayload } = payload;
            const collectionRef = admin.firestore().collection(this.nameCollect);
            const docRef = id ? collectionRef.doc(id) : collectionRef.doc()

            if (id) {
                const document = await docRef.get();
                if (document.exists) {
                    return {
                        success: false,
                        message: "Dữ liệu đã tồn tại"
                    };
                }
            }

            const createdTime = this._ensureTimestamp(createdAt);
            const updatedTime = this._ensureTimestamp(updatedAt);

            await docRef.set({
                id: docRef.id,
                createdAt: createdTime,
                updatedAt: updatedTime,
                ...restPayload
            });

            return {
                success: true,
                message: "Tạo thành công"
            };
        } catch (error) {
            return {
                success: false,
                message: `Lỗi: ${error.message}`
            };
        }
    }

    _ensureTimestamp(value, fallbackToNow = true) {
        if (value instanceof Timestamp) {
            return value;
        }

        const converted = strIso8601ToTimestamp(value);
        if (converted instanceof Timestamp) {
            return converted;
        }

        return fallbackToNow ? Timestamp.now() : null;
    }
}

module.exports = BaseService;