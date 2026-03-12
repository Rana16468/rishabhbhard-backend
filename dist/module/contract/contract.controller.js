"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractController = void 0;
const contract_services_1 = require("./contract.services");
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utility/catchAsync"));
const sendRespone_1 = __importDefault(require("../../utility/sendRespone"));
const createContract = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield contract_services_1.ContractService.createContractIntoDb(req.body);
    (0, sendRespone_1.default)(res, { success: true, statusCode: http_status_1.default.CREATED, message: "Sucessfulled Added Contract", data: result });
}));
const AllContract = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield contract_services_1.ContractService.AllContractIntoDb();
    (0, sendRespone_1.default)(res, { success: true, statusCode: http_status_1.default.OK, message: "Successfully Find All Conreact", data: result });
}));
const SpecificContractId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield contract_services_1.ContractService.SpecificContractIdIntoDb(id);
    (0, sendRespone_1.default)(res, { success: true, statusCode: http_status_1.default.OK, message: "Successfully Get Specific Contract", data: result });
}));
const UpdateContract = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield contract_services_1.ContractService.UpdateContractFromDb(id, req.body);
    (0, sendRespone_1.default)(res, { success: true, statusCode: http_status_1.default.OK, message: "Successfully Updated Contract Information", data: result });
}));
const DeleteContract = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield contract_services_1.ContractService.DeleteContractFromDb(id);
    (0, sendRespone_1.default)(res, { success: true, statusCode: http_status_1.default.OK, message: "Successfully Delete Contrcat Info", data: result });
}));
const FavoriteContrcat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield contract_services_1.ContractService.FavoriteContrcatFromDb(id);
    (0, sendRespone_1.default)(res, { success: true, statusCode: http_status_1.default.OK, message: "Successfully Recorded Fevorite", data: result });
}));
exports.ContractController = {
    createContract,
    AllContract,
    SpecificContractId,
    UpdateContract,
    DeleteContract,
    FavoriteContrcat
};
