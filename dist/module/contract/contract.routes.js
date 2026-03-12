"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContructRouter = void 0;
const express_1 = __importDefault(require("express"));
const contract_controller_1 = require("./contract.controller");
const contract_zod_validation_1 = require("./contract.zod.validation");
const validationRequest_1 = __importDefault(require("../../middleware/validationRequest"));
const router = express_1.default.Router();
router.post('/', (0, validationRequest_1.default)(contract_zod_validation_1.ContractValidation.ContractValidationSchema), contract_controller_1.ContractController.createContract);
router.get("/", contract_controller_1.ContractController.AllContract);
router.get('/:id', contract_controller_1.ContractController.SpecificContractId);
router.patch("/:id", (0, validationRequest_1.default)(contract_zod_validation_1.ContractValidation.UpdateContractValidationSchema), contract_controller_1.ContractController.UpdateContract);
router.delete("/:id", contract_controller_1.ContractController.DeleteContract);
router.patch("/favorite/:id", contract_controller_1.ContractController.FavoriteContrcat);
exports.ContructRouter = router;
