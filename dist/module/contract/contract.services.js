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
exports.ContractService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const contract_model_1 = require("./contract.model");
const ApiError_1 = __importDefault(require("../../app/error/ApiError"));
const createContractIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const buildInShoes = new contract_model_1.Contract(payload);
    const result = yield buildInShoes.save();
    return result;
});
const AllContractIntoDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield contract_model_1.Contract.find({}).sort({ isfavorite: -1 });
    return result;
});
const SpecificContractIdIntoDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield contract_model_1.Contract.findById(id);
    return result;
});
const UpdateContractFromDb = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield contract_model_1.Contract.findById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Not Exist in System", "");
    }
    const result = yield contract_model_1.Contract.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    return result;
});
const DeleteContractFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield contract_model_1.Contract.findById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Not Exist in the System", "");
    }
    const result = yield contract_model_1.Contract.updateOne({ _id: id }, { isDelete: true });
    return result;
});
const FavoriteContrcatFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield contract_model_1.Contract.findById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User Not Exist in the System", "");
    }
    const result = yield contract_model_1.Contract.updateOne({ _id: id }, { isfavorite: (isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.isfavorite) ? false : true });
    return result;
});
exports.ContractService = {
    createContractIntoDb,
    AllContractIntoDb,
    SpecificContractIdIntoDb,
    UpdateContractFromDb,
    DeleteContractFromDb,
    FavoriteContrcatFromDb
};
