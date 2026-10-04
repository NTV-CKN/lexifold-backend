const admin = require("firebase-admin");
const { Timestamp, Transaction } = require("firebase-admin/firestore");
const { ensureTimestamp, timestampToStrIso } = require("../../utils/convert.utils");
const { FieldPath } = require("firebase-admin/firestore");

/**
 * Lớp BaseService sẽ làm việc với 3 dữ liệu chính:
 *  @param {Object} id
 *  @param {Timestamp|String} createdAt
 *  @param {Timestamp|String} updatedAt
 * 
 * Lớp này chỉ làm các logic CRUD chung, giả sử muốn
 * lưu một dữ liệu thuộc về 1 người dùng thì ta sẽ truyền
 * uid được trích xuất từ jwt trong request phía client
 * vào payload.
 */
class BaseService {
    constructor(nameCollect) {
        this.nameCollect = nameCollect;
    }

    /**
     * 
     * @param {Object} filters 
     * 
     * Hàm này tiến hành trả về kết quả phân trang theo
     * hướng Cursor. 
     * 
     * Các dữ liệu cần phải có trong đối tượng 'filters':
     *  + limit: Giới hạn các phần tử được trả về.
     *  + lastId: Dùng để lấy tiếp các item phía sau id này.
     *  + filters: Chứa các key - value dùng để lọc ra các document cho phù hợp.
     *  + sortBy: Dùng để sắp xếp các dữ liệu trước khi lấy ra.
     */
    async getItemsCursor({
        limit = 20, lastId = null, filters = {}, sortBy = "createdAt"
    } = {}) {
        try {
            let query = admin.firestore().collection(this.nameCollect);

            //Lọc các document có field phù hợp
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null) {
                    query = query.where(key, "==", filters[key]);
                }
            });

            //Sắp xếp các document theo field chỉ định 
            query = query
                .orderBy(sortBy, 'desc')
                .orderBy(FieldPath.documentId(), 'desc');

            //Nếu có lastId thì bắt đầu lấy dữ liệu sau document đó
            if (lastId) {
                const lastDoc = await admin.firestore().collection(this.nameCollect).doc(lastId).get();
                if (lastDoc.exists)
                    query = query.startAfter(lastDoc);
                else
                    throw new Error("Không tìm thấy lastId tương ứng");
            }

            const snapshots = (await query.limit(limit + 1).get());
            if (!snapshots.empty) {
                const docSnapshots = snapshots.docs;
                const hasNextPage = docSnapshots.length > limit;
                //Nếu lấy dư 1 phần tử và > limit thì bỏ phần tử thừa đó khỏi kết quả trả về
                if (hasNextPage) {
                    docSnapshots.pop();
                }

                const items = docSnapshots.map(doc => {
                    const {createdAt, updatedAt, ...rest} = doc.data();

                    return {
                        id: doc.id,
                        createdAt: timestampToStrIso(createdAt),
                        updatedAt: timestampToStrIso(updatedAt), 
                        ...rest
                    };
                });

                const nextCursorId = items.length > 0 ? items[items.length - 1].id : null;

                return {
                    items: items,
                    nextCursorId: nextCursorId,
                    hasNextPage: hasNextPage
                };
            } else {
                return {
                    items: [],
                    nextCursorId: null,
                    hasNextPage: false
                };
            }
        } catch (error) {
            throw new Error(error.message || error);
        }
    }

    /**
     * 
     * @param {Object} payload 
     * @param {Transaction} transaction 
     * @returns Promise<Object>
     * 
     * Hỗ trợ ghi dữ liệu với transaction (optional)
     */
    create = async (payload, transaction = null) => {
        try {
            const { id, createdAt, updatedAt, ...restPayload } = payload || {};
            const collectionRef = admin.firestore().collection(this.nameCollect);
            const docRef = id ? collectionRef.doc(id) : collectionRef.doc()

            const createdTime = ensureTimestamp(createdAt);
            const updatedTime = ensureTimestamp(updatedAt);

            if (transaction) {
                transaction.set(docRef, {
                    id: docRef.id,
                    createdAt: createdTime,
                    updatedAt: updatedTime,
                    ...restPayload
                }, {
                    merge: false
                });
            } else {
                await docRef.set({
                    id: docRef.id,
                    createdAt: createdTime,
                    updatedAt: updatedTime,
                    ...restPayload
                }, { merge: false });
            }

            return {
                success: true,
                message: "Tạo thành công"
            };
        } catch (error) {
            if (transaction) {
                throw error;
            }

            return {
                success: false,
                message: `Lỗi: ${error.message}`
            };
        }
    }

    /**
     * 
     * @param {Object} payload 
     * @param {Transaction} transaction 
     * @returns Object
     * 
     * Hỗ trợ ghi nhiều dữ liệu với transaction (optional).
     * 
     * @{payload} phải chứa thuộc tính 'items' kiểu danh sách
     * để thực hiện ghi các dữ liệu bên trong và mỗi item phải chứa thuộc tính @{id}.
     * 
     * Nếu có dữ liệu dùng chung (tức nó sẽ xuất hiện trong các item thì ta
     * định nghĩa thêm cho payload).
     */
    createMany = async (payload, transaction = null) => {
        try {
            const { items, ...restPayload } = payload || {};
            if (!Array.isArray(items) || items.length === 0) {
                return {
                    success: false,
                    message: "Không có dữ liệu để tạo",
                    data: []
                };
            }

            if (transaction && items.length > 450) {
                throw new Error(
                    "Transaction không thể xử lý vượt quá 450 items trong một lần ghi."
                );
            }

            const collectionRef = admin.firestore().collection(this.nameCollect);
            const objectDatasWithRef = items.map((rawItem) => {
                const item = rawItem || {};
                const docRef = item.id
                    ? collectionRef.doc(item.id)
                    : collectionRef.doc();
                return { docRef, item };
            });

            if (transaction) {
                objectDatasWithRef.forEach((objDataWithRef) => {
                    const { id, createdAt, updatedAt, ...finalPayload } = objDataWithRef.item;
                    const createdTime = ensureTimestamp(createdAt);
                    const updatedTime = ensureTimestamp(updatedAt);

                    transaction.set(objDataWithRef.docRef, {
                        id: objDataWithRef.docRef.id,
                        ...restPayload,
                        ...finalPayload,
                        createdAt: createdTime,
                        updatedAt: updatedTime,
                    }, { merge: false });
                });
            } else {
                const CHUNK_SIZE = 400;

                for (let i = 0; i < objectDatasWithRef.length; i += CHUNK_SIZE) {
                    const chunk = objectDatasWithRef.slice(i, i + CHUNK_SIZE);
                    const batch = admin.firestore().batch();

                    chunk.forEach((objDataWithRef) => {
                        const { id, createdAt, updatedAt, ...finalPayload } = objDataWithRef.item;
                        const createdTime = ensureTimestamp(createdAt);
                        const updatedTime = ensureTimestamp(updatedAt);

                        batch.set(objDataWithRef.docRef, {
                            id: objDataWithRef.docRef.id,
                            ...restPayload,
                            ...finalPayload,
                            createdAt: createdTime,
                            updatedAt: updatedTime
                        }, { merge: false });
                    });

                    await batch.commit();
                }
            }

            return {
                success: true,
                message: "Tạo thành công"
            };
        } catch (error) {
            if (transaction) {
                throw error;
            }

            return {
                success: false,
                message: `Lỗi: ${error.message}`
            };
        }
    }
}

module.exports = BaseService;