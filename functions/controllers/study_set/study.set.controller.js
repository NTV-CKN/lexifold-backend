const { strIso8601ToTimestamp } = require("../../utils/convert.utils");

class StudySetController {
    /**
     * @typedef {Object} VocabularyPayload
     * @property {string} id - ID của từ vựng (UUID)
     * @property {string} studySetId - ID của học phần chứa từ vựng
     * @property {string} term - Thuật ngữ / Từ gốc
     * @property {string} definition - Định nghĩa / Nghĩa của từ
     * @property {string|null} [example] - Ví dụ minh họa (optional)
     * @property {string|null} [imageUrl] - URL hình ảnh minh họa (optional)
     * @property {string} termLanguage - Mã ngôn ngữ của thuật ngữ (vd: 'en')
     * @property {string} definitionLanguage - Mã ngôn ngữ của định nghĩa (vd: 'vi')
     * @property {string} updatedAt - Thời gian cập nhật cuối (Chuỗi ISO 8601)
     */

    /**
     * @typedef {Object} StudySetPayload
     * @property {string} id - ID của học phần (UUID)
     * @property {string} title - Tiêu đề học phần
     * @property {string} [subDescription] - Mô tả ngắn về học phần (optional)
     * @property {boolean} isPublic - Trạng thái công khai của học phần
     * @property {string} sourceLanguage - Ngôn ngữ nguồn (vd: 'en')
     * @property {string} targetLanguage - Ngôn ngữ đích (vd: 'vi')
     * @property {string} createdAt - Thời gian tạo (Chuỗi ISO 8601)
     * @property {string} updatedAt - Thời gian cập nhật cuối (Chuỗi ISO 8601)
     * @property {VocabularyPayload[]} vocabularies - Danh sách các từ vựng đi kèm
     */
    async addStudySet(req, res) {
        try {
            
        } catch (error) {

        }
    }

    _mapStudySetToObject(payload) {
        const { updatedAt, createdAt, vocabularies, ...restPayload } = payload;

        return {
            updatedAt: strIso8601ToTimestamp(updatedAt),
            createdAt: strIso8601ToTimestamp(createdAt),
            ...restPayload
        };
    }

    _mapVocabulariesToObject(payload) {
        const { vocabularies } = payload;
        if (!vocabularies || !Array.isArray(vocabularies) || vocabularies.length === 0) {
            return [];
        }

        return vocabularies.map((vocab) => {
            const { example, imageUrl, updatedAt, ...restVocab } = vocab;

            return {
                example: example || null,
                imageUrl: imageUrl || null,
                updatedAt: strIso8601ToTimestamp(updatedAt),
                ...restVocab
            };
        });
    }
}