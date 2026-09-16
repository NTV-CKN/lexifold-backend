class BaseController {
    constructor(service) {
        if(!service) {
            throw new Error("Service không hợp lệ");
        }

        this.service = service;
    }
}

module.exports = new BaseController;