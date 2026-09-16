const BaseService = require("../base/base.service");

class VocabularyService extends BaseService {
    constructor() {
        super("vocabularies");
        this._vocabularyCollection = "vocabularies"
    }
}

module.exports = new VocabularyService();