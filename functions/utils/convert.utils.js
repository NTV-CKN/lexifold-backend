const { Timestamp } = require("firebase-admin/firestore");

const strIso8601ToTimestamp = (strIso) => {
    if(!strIso || typeof strIso !== 'string') {
        return null;
    }

    const date = new Date(strIso);
    if(isNaN(date)) {
        return null;
    }

    return Timestamp.fromDate(date);
}

/**
 * 
 * @param {String} value 
 * @param {boolean} fallbackToNow 
 * @returns Timestamp
 * 
 * Hàm này sẽ nhận vào giá trị về thời gian dạng iso string, với lựa chọn
 * fallbackToNow giúp hàm xác định nên trả về giá trị hiện tại hay null nếu
 * việc chuyển đổi diễn ra không thành công.
 */
const ensureTimestamp = (value, fallbackToNow = true) => {
        if (value instanceof Timestamp) {
            return value;
        }

        const converted = strIso8601ToTimestamp(value);
        if (converted instanceof Timestamp) {
            return converted;
        }

        return fallbackToNow ? Timestamp.now() : null;
    }

module.exports = {
    strIso8601ToTimestamp,
    ensureTimestamp
};