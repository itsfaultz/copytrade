const WebSocket = require('ws');
const axios = require('axios');
const bs58 = require('bs58');
const { pumpFunBuy, pumpFunSell } = require('./src/swap');
const { TransactionMode } = require('./src/types');
const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fetch = require('cross-fetch');
const { Wallet } = require('@project-serum/anchor');
const RaydiumSwap = require('./src/RaydiumSwap').default;

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option('PUMPFUN', {
        type: 'boolean',
        description: 'Enable or disable pumpFun',
        default: true,
    })
    .argv;

const copyAddress = argv.COPY_ADDRESS;
const privateKey = argv.PRIVATE_KEY;
const rpcurl = argv.RPC_URL;
const solIn = parseFloat(argv.SOL_IN);
const priorityFeeInSol = parseFloat(argv.PRIORITY_FEE_IN_SOL);
let slippageDecimal = parseFloat(argv.SLIPPAGE_DECIMAL);

// Ensure slippageDecimal is an integer
slippageDecimal = Math.round(slippageDecimal);

// Replace 'YOUR_API_KEY' with your actual Helius API key
const API_KEY = 'da21211f-f539-41d2-aa93-8b673fefecc3';
const WS_URL = `wss://atlas-mainnet.helius-rpc.com?api-key=${API_KEY}`;


async function getTokenAmount(privateKey) {
    // Ensure the private key is a Uint8Array
    if (typeof privateKey === 'string') {
        // Decode the private key from base58 format
        privateKey = bs58.decode(privateKey);
    } else if (!Array.isArray(privateKey) && !(privateKey instanceof Uint8Array)) {
        throw new Error("Invalid private key format");
    }
    
    // Ensure the private key is the correct length
    if (privateKey.length !== 64) {
        throw new Error("bad secret key size");
    }

    const connection = new solanaWeb3.Connection(rpcurl, 'confirmed');
    const keypair = solanaWeb3.Keypair.fromSecretKey(Uint8Array.from(privateKey));

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, {
        programId: splToken.TOKEN_PROGRAM_ID,
    });

    const tokenBalances = tokenAccounts.value.map(tokenAccount => {
        const amount = tokenAccount.account.data.parsed.info.tokenAmount.amount; // Use the integer amount
        const mint = tokenAccount.account.data.parsed.info.mint;
        return { mint, amount };
    });

    return tokenBalances;
}

async function main() {

    const ws = new WebSocket(WS_URL);

    // Function to send a request to the WebSocket server
    function sendRaydium(ws) {
        const request = {
            jsonrpc: "2.0",
            id: 420,
            method: "transactionSubscribe",
            params: [
                {   
                    failed: false,
                    accountInclude: ["675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"]
                },
                {
                    commitment: "processed",
                    encoding: "jsonParsed",
                    transactionDetails: "full",
                    maxSupportedTransactionVersion: 0
                }
            ]
        };
        ws.send(JSON.stringify(request));
    }

    function sendJupiter(ws) {
        const request = {
            jsonrpc: "2.0",
            id: 420,
            method: "transactionSubscribe",
            params: [
                {   
                    failed: false,
                    accountInclude: ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"]
                },
                {
                    commitment: "processed",
                    encoding: "jsonParsed",
                    transactionDetails: "full",
                    maxSupportedTransactionVersion: 0
                }
            ]
        };
        ws.send(JSON.stringify(request));
    }

    // Function to send a request to the WebSocket server
    function sendPumpfun(ws) {
        const request = {
            jsonrpc: "2.0",
            id: 420,
            method: "transactionSubscribe",
            params: [
                {
                    failed: false,
                    accountInclude: ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"],  // pump.fun on-chain program
                },
                {
                    commitment: "confirmed",
                    encoding: "jsonParsed",
                    transactionDetails: "full",
                    maxSupportedTransactionVersion: 0,
                },
            ],
        };
        ws.send(JSON.stringify(request));
    }

    // Event handlers for WebSocket
    ws.on('open', function open() {
        console.log('WebSocket is open');
        sendRaydium(ws);
        sendJupiter(ws);
        if (argv.PUMPFUN) {
            sendPumpfun(ws);  // Send a request once the WebSocket is open
        }
    });

    ws.on('message', function incoming(data) {
        const messageStr = data.toString('utf8');
        try {
            const messageObj = JSON.parse(messageStr);
            const result = messageObj.params.result;

            copyBuy(copyAddress, privateKey, result, solIn, priorityFeeInSol, slippageDecimal);
            copySell(copyAddress, privateKey, result, priorityFeeInSol, slippageDecimal);

        } catch (e) {
            console.error('Error processing message:', e);
        }
    });

    async function copyBuy(copyAddress, privateKey, result, solIn, priorityFeeInSol, slippageDecimal) {
        const signature = result.signature;  // Extract the signature
        const logs = result.transaction.meta.logMessages;
        const accountKeys = result.transaction.transaction.message.accountKeys.map(ak => ak.pubkey);
        if (logs && logs.some(log => log.includes('Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'))) {
            for (const balance of result.transaction.meta.postTokenBalances) {
                const preBalance = result.transaction.meta.preTokenBalances.find(b => b.accountIndex === balance.accountIndex);
                if (preBalance && balance.owner === copyAddress && balance.mint !== 'So11111111111111111111111111111111111111112') {
                    const preAmount = parseFloat(preBalance.uiTokenAmount.uiAmount);
                    const postAmount = parseFloat(balance.uiTokenAmount.uiAmount);
                    if (postAmount > preAmount) {  // Check if it is a buy transaction
                        const executeSwap = true; // Change to true to execute swap
                        const useVersionedTransaction = true; // Use versioned transaction
                        const tokenAAmount = solIn;
                        const baseMint = 'So11111111111111111111111111111111111111112'; // e.g. SOLANA mint address
                        const quoteMint = balance.mint; // e.g. PYTH mint address

                        // Get token balances using the private key
                        const raydiumSwap = new RaydiumSwap(rpcurl, privateKey);
                        console.log(`Raydium swap initialized`);

                        // Loading with pool keys from https://api.raydium.io/v2/sdk/liquidity/mainnet.json
                        await raydiumSwap.loadPoolKeys();
                        console.log(`Loaded pool keys`);

                        // Trying to find pool info in the json we loaded earlier and by comparing baseMint and tokenBAddress
                        let poolInfo = raydiumSwap.findPoolInfoForTokens(baseMint, quoteMint);

                        if (!poolInfo) poolInfo = await raydiumSwap.findRaydiumPoolInfo(baseMint, quoteMint);

                        if (!poolInfo) {
                            throw new Error("Couldn't find the pool info");
                        }

                        console.log('Found pool info', poolInfo);

                        const tx = await raydiumSwap.getSwapTransaction(
                            quoteMint,
                            tokenAAmount,
                            poolInfo,
                            0.01 * 1000000, // Prioritization fee, now set to (0.0005 SOL)
                            useVersionedTransaction,
                            'in',
                            35 // Slippage
                        );

                        if (executeSwap) {
                            const txid = useVersionedTransaction
                            ? await raydiumSwap.sendVersionedTransaction(tx)
                            : await raydiumSwap.sendLegacyTransaction(tx);

                            console.log(`https://solscan.io/tx/${txid}`);
                        } else {
                            const simRes = useVersionedTransaction
                            ? await raydiumSwap.simulateVersionedTransaction(tx)
                            : await raydiumSwap.simulateLegacyTransaction(tx);

                            console.log(simRes);
                        }

                    }

                }
            }
        }
        if (logs && logs.some(log => log.includes('Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'))) {
            
            if (logs && logs.some(log => log.includes('Program log: Instruction: Buy'))) {
                const tracked = accountKeys.find(key => key.endsWith(copyAddress));
                if (tracked === copyAddress) {

                    const mintAddress = accountKeys.find(key => key.endsWith('pump'));
                    if (!mintAddress) {
                        console.error('No mintAddress found ending with "pump"');
                        return;
                    }
        
                    console.log(`${accountKeys[0]} made a buy!`);
                    console.log('Mint Address:', mintAddress);
                    console.log('tx:', signature);
        
                    const txMode = TransactionMode.Execution;
        
                    const attemptSwap = async (attempt = 1) => {
                        try {
                            await pumpFunBuy(txMode, privateKey, mintAddress, solIn, priorityFeeInSol, slippageDecimal);
                        } catch (error) {
                            if (attempt <= 3) {
                                console.log(`Retrying pumpFunBuy: Attempt ${attempt}`);
                                await attemptSwap(attempt + 1);
                            } else {
                                console.error('Error in swap logic after 3 retries:', error);
                            }
                        }
                    };
        
                    await attemptSwap();
                }
            }
    
        }
    }

    async function copySell(copyAddress, privateKey, result, priorityFeeInSol, slippageDecimal) {
        const logs = result.transaction.meta.logMessages;
        const meta = result.transaction.meta;
        const preTokenBalances = result.transaction.meta.preTokenBalances;
        const postTokenBalances = result.transaction.meta.postTokenBalances;
        const accountKeys = result.transaction.transaction.message.accountKeys.map(ak => ak.pubkey);
        const signature = result.signature;  // Extract the signature
        
        if (logs && logs.some(log => log.includes('Program 675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'))) {
            for (const balance of result.transaction.meta.postTokenBalances) {
                const preBalance = result.transaction.meta.preTokenBalances.find(b => b.accountIndex === balance.accountIndex);
                if (preBalance && balance.owner === copyAddress && balance.mint !== 'So11111111111111111111111111111111111111112') {
                    const preAmount = parseFloat(preBalance.uiTokenAmount.uiAmount);
                    const postAmount = parseFloat(balance.uiTokenAmount.uiAmount);
                    if (postAmount < preAmount) {  // Check if it is a buy transaction
                        const executeSwap = true; // Change to true to execute swap
                        const useVersionedTransaction = true; // Use versioned transaction

                        const quoteMint = 'So11111111111111111111111111111111111111112'; // e.g. SOLANA mint address
                        const baseMint = balance.mint; // e.g. PYTH mint address

                        const raydiumSwap = new RaydiumSwap(rpcurl, privateKey);
                        console.log(`Raydium swap initialized`);

                        // Loading with pool keys from https://api.raydium.io/v2/sdk/liquidity/mainnet.json
                        await raydiumSwap.loadPoolKeys();
                        console.log(`Loaded pool keys`);

                        // Trying to find pool info in the json we loaded earlier and by comparing baseMint and tokenBAddress
                        let poolInfo = raydiumSwap.findPoolInfoForTokens(baseMint, quoteMint);

                        if (!poolInfo) poolInfo = await raydiumSwap.findRaydiumPoolInfo(baseMint, quoteMint);

                        if (!poolInfo) {
                            throw new Error("Couldn't find the pool info");
                        }

                        console.log('Found pool info', poolInfo);
                        // Find the pre and post balances for the account
                        const preBalance = preTokenBalances.find(balance => balance.owner === copyAddress && balance.mint === baseMint);
                        const postBalance = postTokenBalances.find(balance => balance.owner === copyAddress && balance.mint === baseMint);
            
                        if (!preBalance || !postBalance) {
                            console.error('Pre or post balance not found for the given account and mint address');
                            return;
                        }
            
                        // Calculate the sell percentage
                        const preAmount = parseFloat(preBalance.uiTokenAmount.uiAmount);
                        const postAmount = parseFloat(postBalance.uiTokenAmount.uiAmount);
                        const soldAmount = preAmount - postAmount;
                        const sellPercentage = (soldAmount / preAmount) * 100;
            
                        console.log(`Sell Percentage: ${sellPercentage.toFixed(2)}%`);
            
                        // Get token balances using the private key
                        const tokenBalances = await getTokenAmount(privateKey);
                        const tokensFound = tokenBalances.find(token => token.mint === baseMint)?.amount;
                        const tokenRounded = Math.round(tokensFound); // Round to the nearest integer
                        const tokenSell = Math.round(tokenRounded * (sellPercentage / 100)); // Ensure it's an integer
                        const tokenAAmount = tokenSell;
                        if (tokenSell === undefined) {
                            console.error('Token balance not found for the specified mint address');
                            return;
                        }

                        const tx = await raydiumSwap.getSwapTransaction(
                            quoteMint,
                            tokenAAmount,
                            poolInfo,
                            0.01 * 1000000, // Prioritization fee, now set to (0.0005 SOL)
                            useVersionedTransaction,
                            'in',
                            35 // Slippage
                        );

                        if (executeSwap) {
                            const txid = useVersionedTransaction
                            ? await raydiumSwap.sendVersionedTransaction(tx)
                            : await raydiumSwap.sendLegacyTransaction(tx);

                            console.log(`https://solscan.io/tx/${txid}`);
                        } else {
                            const simRes = useVersionedTransaction
                            ? await raydiumSwap.simulateVersionedTransaction(tx)
                            : await raydiumSwap.simulateLegacyTransaction(tx);

                            console.log(simRes);
                        }

                    }

                }
            }
        }
        
        if (logs && logs.some(log => log.includes('Program 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P invoke'))) {
            
            if (logs && logs.some(log => log.includes('Program log: Instruction: Sell'))) {
                if (accountKeys[0] === copyAddress) {
                    const mintAddress = accountKeys.find(key => key.endsWith('pump'));
                    if (!mintAddress) {
                        console.error('No mintAddress found ending with "pump"');
                        return;
                    }
        
                    console.log(`${accountKeys[0]} made a sell!`);
                    console.log('Mint Address:', mintAddress);
                    console.log('tx:', signature);
        
                    // Find the pre and post balances for the account
                    const preBalance = preTokenBalances.find(balance => balance.owner === copyAddress && balance.mint === mintAddress);
                    const postBalance = postTokenBalances.find(balance => balance.owner === copyAddress && balance.mint === mintAddress);
        
                    if (!preBalance || !postBalance) {
                        console.error('Pre or post balance not found for the given account and mint address');
                        return;
                    }
        
                    // Calculate the sell percentage
                    const preAmount = parseFloat(preBalance.uiTokenAmount.uiAmount);
                    const postAmount = parseFloat(postBalance.uiTokenAmount.uiAmount);
                    const soldAmount = preAmount - postAmount;
                    const sellPercentage = (soldAmount / preAmount) * 100;
        
                    console.log(`Sell Percentage: ${sellPercentage.toFixed(2)}%`);
        
                    // Get token balances using the private key
                    const tokenBalances = await getTokenAmount(privateKey);
                    const tokensFound = tokenBalances.find(token => token.mint === mintAddress)?.amount;
                    const tokenRounded = Math.round(tokensFound); // Round to the nearest integer
                    const tokenSell = Math.round(tokenRounded * (sellPercentage / 100)); // Ensure it's an integer
        
                    if (tokenSell === undefined) {
                        console.error('Token balance not found for the specified mint address');
                        return;
                    }
        
                    const txMode = TransactionMode.Execution;
        
                    const attemptSwap = async (attempt = 1) => {
                        try {
                            await pumpFunSell(txMode, privateKey, mintAddress, tokenSell, priorityFeeInSol, slippageDecimal);
                        } catch (error) {
                            if (attempt <= 3) {
                                console.log(`Retrying pumpFunSell: Attempt ${attempt}`);
                                await attemptSwap(attempt + 1);
                            } else {
                                console.error('Error in swap logic after 3 retries:', error);
                            }
                        }
                    };
        
                    await attemptSwap();
                }
            }
        }    
    }
    
    ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
    });

    ws.on('close', function close() {
        console.log('WebSocket is closed');
    });
}

main();
