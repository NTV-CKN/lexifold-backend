const BaseService = require("../base/base.service");

class StudySetService extends BaseService {
    constructor() {
        super("study_sets");
    }
}

module.exports = new StudySetService();