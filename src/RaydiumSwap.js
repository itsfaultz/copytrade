"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var raydium_sdk_1 = require("@raydium-io/raydium-sdk");
var anchor_1 = require("@project-serum/anchor");
var bs58_1 = __importDefault(require("bs58"));
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var RaydiumSwap = /** @class */ (function () {
    function RaydiumSwap(RPC_URL, WALLET_PRIVATE_KEY) {
        this.connection = new web3_js_1.Connection(RPC_URL, { commitment: 'confirmed' });
        this.wallet = new anchor_1.Wallet(web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(WALLET_PRIVATE_KEY)));
    }
    RaydiumSwap.prototype.loadPoolKeys = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, error_1, liquidityJsonResp, liquidityJson, allPoolKeysJson;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 3, , 7]);
                        if (!(0, fs_1.existsSync)('pools.json')) return [3 /*break*/, 2];
                        _a = this;
                        _c = (_b = JSON).parse;
                        return [4 /*yield*/, (0, promises_1.readFile)('pools.json')];
                    case 1:
                        _a.allPoolKeysJson = _c.apply(_b, [(_f.sent()).toString()]);
                        return [2 /*return*/];
                    case 2: throw new Error('no file found');
                    case 3:
                        error_1 = _f.sent();
                        return [4 /*yield*/, fetch('https://api.raydium.io/v2/sdk/liquidity/mainnet.json')];
                    case 4:
                        liquidityJsonResp = _f.sent();
                        if (!liquidityJsonResp.ok)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, liquidityJsonResp.json()];
                    case 5:
                        liquidityJson = (_f.sent());
                        allPoolKeysJson = __spreadArray(__spreadArray([], ((_d = liquidityJson === null || liquidityJson === void 0 ? void 0 : liquidityJson.official) !== null && _d !== void 0 ? _d : []), true), ((_e = liquidityJson === null || liquidityJson === void 0 ? void 0 : liquidityJson.unOfficial) !== null && _e !== void 0 ? _e : []), true);
                        this.allPoolKeysJson = allPoolKeysJson;
                        return [4 /*yield*/, (0, promises_1.writeFile)('pools.json', JSON.stringify(allPoolKeysJson))];
                    case 6:
                        _f.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    RaydiumSwap.prototype.findPoolInfoForTokens = function (mintA, mintB) {
        var poolData = this.allPoolKeysJson.find(function (i) { return (i.baseMint === mintA && i.quoteMint === mintB) || (i.baseMint === mintB && i.quoteMint === mintA); });
        if (!poolData)
            return null;
        return (0, raydium_sdk_1.jsonInfo2PoolKeys)(poolData);
    };
    RaydiumSwap.prototype._getProgramAccounts = function (baseMint, quoteMint) {
        return __awaiter(this, void 0, void 0, function () {
            var layout;
            return __generator(this, function (_a) {
                layout = raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4;
                return [2 /*return*/, this.connection.getProgramAccounts(new web3_js_1.PublicKey(RaydiumSwap.RAYDIUM_V4_PROGRAM_ID), {
                        filters: [
                            { dataSize: layout.span },
                            {
                                memcmp: {
                                    offset: layout.offsetOf('baseMint'),
                                    bytes: new web3_js_1.PublicKey(baseMint).toBase58(),
                                },
                            },
                            {
                                memcmp: {
                                    offset: layout.offsetOf('quoteMint'),
                                    bytes: new web3_js_1.PublicKey(quoteMint).toBase58(),
                                },
                            },
                        ],
                    })];
            });
        });
    };
    RaydiumSwap.prototype.getProgramAccounts = function (baseMint, quoteMint) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this._getProgramAccounts(baseMint, quoteMint),
                            this._getProgramAccounts(quoteMint, baseMint),
                        ])];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.filter(function (r) { return r.length > 0; })[0] || []];
                }
            });
        });
    };
    RaydiumSwap.prototype.findRaydiumPoolInfo = function (baseMint, quoteMint) {
        return __awaiter(this, void 0, void 0, function () {
            var layout, programData, collectedPoolResults, pool, market, authority, marketProgramId, poolKeys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layout = raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4;
                        return [4 /*yield*/, this.getProgramAccounts(baseMint, quoteMint)];
                    case 1:
                        programData = _a.sent();
                        collectedPoolResults = programData
                            .map(function (info) { return (__assign({ id: new web3_js_1.PublicKey(info.pubkey), version: 4, programId: new web3_js_1.PublicKey(RaydiumSwap.RAYDIUM_V4_PROGRAM_ID) }, layout.decode(info.account.data))); })
                            .flat();
                        pool = collectedPoolResults[0];
                        if (!pool)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.connection.getAccountInfo(pool.marketId).then(function (item) { return (__assign({ programId: item.owner }, raydium_sdk_1.MARKET_STATE_LAYOUT_V3.decode(item.data))); })];
                    case 2:
                        market = _a.sent();
                        authority = raydium_sdk_1.Liquidity.getAssociatedAuthority({
                            programId: new web3_js_1.PublicKey(RaydiumSwap.RAYDIUM_V4_PROGRAM_ID),
                        }).publicKey;
                        marketProgramId = market.programId;
                        poolKeys = {
                            id: pool.id,
                            baseMint: pool.baseMint,
                            quoteMint: pool.quoteMint,
                            lpMint: pool.lpMint,
                            baseDecimals: Number.parseInt(pool.baseDecimal.toString()),
                            quoteDecimals: Number.parseInt(pool.quoteDecimal.toString()),
                            lpDecimals: Number.parseInt(pool.baseDecimal.toString()),
                            version: pool.version,
                            programId: pool.programId,
                            openOrders: pool.openOrders,
                            targetOrders: pool.targetOrders,
                            baseVault: pool.baseVault,
                            quoteVault: pool.quoteVault,
                            marketVersion: 3,
                            authority: authority,
                            marketProgramId: marketProgramId,
                            marketId: market.ownAddress,
                            marketAuthority: raydium_sdk_1.Market.getAssociatedAuthority({
                                programId: marketProgramId,
                                marketId: market.ownAddress,
                            }).publicKey,
                            marketBaseVault: market.baseVault,
                            marketQuoteVault: market.quoteVault,
                            marketBids: market.bids,
                            marketAsks: market.asks,
                            marketEventQueue: market.eventQueue,
                            withdrawQueue: pool.withdrawQueue,
                            lpVault: pool.lpVault,
                            lookupTableAccount: web3_js_1.PublicKey.default,
                        };
                        return [2 /*return*/, poolKeys];
                }
            });
        });
    };
    RaydiumSwap.prototype.getOwnerTokenAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var walletTokenAccount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
                            programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
                        })];
                    case 1:
                        walletTokenAccount = _a.sent();
                        return [2 /*return*/, walletTokenAccount.value.map(function (i) { return ({
                                pubkey: i.pubkey,
                                programId: i.account.owner,
                                accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(i.account.data),
                            }); })];
                }
            });
        });
    };
    RaydiumSwap.prototype.getSwapTransaction = function (toToken_1, amount_1, poolKeys_1) {
        return __awaiter(this, arguments, void 0, function (toToken, amount, poolKeys, maxLamports, useVersionedTransaction, fixedSide, slippage) {
            var directionIn, _a, minAmountOut, amountIn, userTokenAccounts, swapTransaction, recentBlockhashForSwap, instructions, versionedTransaction, legacyTransaction;
            if (maxLamports === void 0) { maxLamports = 100000; }
            if (useVersionedTransaction === void 0) { useVersionedTransaction = true; }
            if (fixedSide === void 0) { fixedSide = 'in'; }
            if (slippage === void 0) { slippage = 5; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        directionIn = poolKeys.quoteMint.toString() == toToken;
                        return [4 /*yield*/, this.calcAmountOut(poolKeys, amount, slippage, directionIn)];
                    case 1:
                        _a = _b.sent(), minAmountOut = _a.minAmountOut, amountIn = _a.amountIn;
                        return [4 /*yield*/, this.getOwnerTokenAccounts()];
                    case 2:
                        userTokenAccounts = _b.sent();
                        return [4 /*yield*/, raydium_sdk_1.Liquidity.makeSwapInstructionSimple({
                                connection: this.connection,
                                makeTxVersion: useVersionedTransaction ? 0 : 1,
                                poolKeys: __assign({}, poolKeys),
                                userKeys: {
                                    tokenAccounts: userTokenAccounts,
                                    owner: this.wallet.publicKey,
                                },
                                amountIn: amountIn,
                                amountOut: minAmountOut,
                                fixedSide: fixedSide,
                                config: {
                                    bypassAssociatedCheck: false,
                                },
                                computeBudgetConfig: {
                                    microLamports: maxLamports,
                                },
                            })];
                    case 3:
                        swapTransaction = _b.sent();
                        return [4 /*yield*/, this.connection.getLatestBlockhash()];
                    case 4:
                        recentBlockhashForSwap = _b.sent();
                        instructions = swapTransaction.innerTransactions[0].instructions.filter(Boolean);
                        if (useVersionedTransaction) {
                            versionedTransaction = new web3_js_1.VersionedTransaction(new web3_js_1.TransactionMessage({
                                payerKey: this.wallet.publicKey,
                                recentBlockhash: recentBlockhashForSwap.blockhash,
                                instructions: instructions,
                            }).compileToV0Message());
                            versionedTransaction.sign([this.wallet.payer]);
                            return [2 /*return*/, versionedTransaction];
                        }
                        legacyTransaction = new web3_js_1.Transaction({
                            blockhash: recentBlockhashForSwap.blockhash,
                            lastValidBlockHeight: recentBlockhashForSwap.lastValidBlockHeight,
                            feePayer: this.wallet.publicKey,
                        });
                        legacyTransaction.add.apply(legacyTransaction, instructions);
                        return [2 /*return*/, legacyTransaction];
                }
            });
        });
    };
    RaydiumSwap.prototype.sendLegacyTransaction = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var txid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.sendTransaction(tx, [this.wallet.payer], {
                            skipPreflight: true,
                        })];
                    case 1:
                        txid = _a.sent();
                        return [2 /*return*/, txid];
                }
            });
        });
    };
    RaydiumSwap.prototype.sendVersionedTransaction = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var txid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.sendTransaction(tx, {
                            skipPreflight: true,
                        })];
                    case 1:
                        txid = _a.sent();
                        return [2 /*return*/, txid];
                }
            });
        });
    };
    RaydiumSwap.prototype.simulateLegacyTransaction = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var txid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.simulateTransaction(tx, [this.wallet.payer])];
                    case 1:
                        txid = _a.sent();
                        return [2 /*return*/, txid];
                }
            });
        });
    };
    RaydiumSwap.prototype.simulateVersionedTransaction = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var txid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.simulateTransaction(tx)];
                    case 1:
                        txid = _a.sent();
                        return [2 /*return*/, txid];
                }
            });
        });
    };
    RaydiumSwap.prototype.getTokenAccountByOwnerAndMint = function (mint) {
        return {
            programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
            pubkey: web3_js_1.PublicKey.default,
            accountInfo: {
                mint: mint,
                amount: 0,
            },
        };
    };
    RaydiumSwap.prototype.calcAmountOut = function (poolKeys_1, rawAmountIn_1) {
        return __awaiter(this, arguments, void 0, function (poolKeys, rawAmountIn, slippage, swapInDirection) {
            var poolInfo, currencyInMint, currencyInDecimals, currencyOutMint, currencyOutDecimals, currencyIn, amountIn, currencyOut, slippageX, _a, amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee;
            if (slippage === void 0) { slippage = 5; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, raydium_sdk_1.Liquidity.fetchInfo({ connection: this.connection, poolKeys: poolKeys })];
                    case 1:
                        poolInfo = _b.sent();
                        currencyInMint = poolKeys.baseMint;
                        currencyInDecimals = poolInfo.baseDecimals;
                        currencyOutMint = poolKeys.quoteMint;
                        currencyOutDecimals = poolInfo.quoteDecimals;
                        if (!swapInDirection) {
                            currencyInMint = poolKeys.quoteMint;
                            currencyInDecimals = poolInfo.quoteDecimals;
                            currencyOutMint = poolKeys.baseMint;
                            currencyOutDecimals = poolInfo.baseDecimals;
                        }
                        currencyIn = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals);
                        amountIn = new raydium_sdk_1.TokenAmount(currencyIn, rawAmountIn.toFixed(currencyInDecimals), false);
                        currencyOut = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals);
                        slippageX = new raydium_sdk_1.Percent(slippage, 100) // 5% slippage
                        ;
                        _a = raydium_sdk_1.Liquidity.computeAmountOut({
                            poolKeys: poolKeys,
                            poolInfo: poolInfo,
                            amountIn: amountIn,
                            currencyOut: currencyOut,
                            slippage: slippageX,
                        }), amountOut = _a.amountOut, minAmountOut = _a.minAmountOut, currentPrice = _a.currentPrice, executionPrice = _a.executionPrice, priceImpact = _a.priceImpact, fee = _a.fee;
                        return [2 /*return*/, {
                                amountIn: amountIn,
                                amountOut: amountOut,
                                minAmountOut: minAmountOut,
                                currentPrice: currentPrice,
                                executionPrice: executionPrice,
                                priceImpact: priceImpact,
                                fee: fee,
                            }];
                }
            });
        });
    };
    RaydiumSwap.RAYDIUM_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
    return RaydiumSwap;
}());
exports.default = RaydiumSwap;
