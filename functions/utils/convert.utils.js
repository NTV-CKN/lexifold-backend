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

module.exports = {
    strIso8601ToTimestamp
};