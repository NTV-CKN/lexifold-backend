const BaseService = require("../base/base.service");
const { ensureTimestamp } = require("../../utils/convert.utils");
const admin = require("firebase-admin");

const vocabularyService = require("../vocabulary/vocabulary.service");

class StudySetService extends BaseService {
    constructor() {
        super("study_sets");
        this._studySetCollection = "study_sets";
    }

    /**
     * 
     * @param {Object} payload 
     * 
     * Yêu cầu truyền vào 1 payload chứa thông tin về học phần, các
     * từ vựng liên quan đi kèm và BẮT BUỘC phải có user.uid được decoded từ JWT 
     */
    createStudySetWithVocabs = async (payload) => {
        try {
            const vocabsObject = this._mapVocabulariesToObject(payload);
            const studySetObject = this._mapStudySetToObject(payload);
            const { uid } = payload;

            if (!uid) {
                throw new Error("Không tìm thấy UID tương ứng");
            }

            await admin.firestore().runTransaction(async (transaction) => {
                //Gọi hàm create của StudySetService
                await this.create({
                    ...studySetObject,
                    uid: uid
                }, transaction);

                //Gọi hàm createMany của VocabularyService
                await vocabularyService.createMany({
                    items: vocabsObject,
                    uid: uid
                }, transaction);
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

    _mapStudySetToObject(payload) {
        const { updatedAt, createdAt, vocabularies, ...restPayload } = payload;

        return {
            updatedAt: ensureTimestamp(updatedAt),
            createdAt: ensureTimestamp(createdAt),
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
                updatedAt: ensureTimestamp(updatedAt),
                ...restVocab
            };
        });
    }
}

module.exports = new StudySetService();