import RaydiumSwap from './RaydiumSwap';
import { Transaction, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

let cachedPoolKeys = null;

export const loadPoolKeys = async (RPC_URL, WALLET_PRIVATE_KEY) => {
  const raydiumSwap = new RaydiumSwap(RPC_URL, WALLET_PRIVATE_KEY);
  await raydiumSwap.loadPoolKeys();
  cachedPoolKeys = raydiumSwap.getPoolKeys();
  console.log('Pool keys loaded and cached');
};

export const sendRaydium = async ({
  slippage,
  quoteMint,
  useVersionedTransaction,
  tokenAAmount,
  baseMint,
  WALLET_PRIVATE_KEY,
  RPC_URL,
  priorityFees,
  executeSwap,
}) => {
  if (
    !slippage ||
    !quoteMint ||
    useVersionedTransaction === undefined ||
    !tokenAAmount ||
    !baseMint ||
    !WALLET_PRIVATE_KEY ||
    !RPC_URL ||
    !priorityFees ||
    executeSwap === undefined
  ) {
    throw new Error('All parameters must be provided');
  }

  if (!cachedPoolKeys) {
    throw new Error('Pool keys not loaded');
  }

  const raydiumSwap = new RaydiumSwap(RPC_URL, WALLET_PRIVATE_KEY);
  raydiumSwap.setPoolKeys(cachedPoolKeys);
  console.log(`Raydium swap initialized`);

  // Trying to find pool info in the cached pool keys
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
    priorityFees * 1000000, // Prioritization fee, now set to (0.0005 SOL)
    useVersionedTransaction,
    'in',
    slippage // Slippage
  );

  if (executeSwap) {
    const txid = useVersionedTransaction
      ? await raydiumSwap.sendVersionedTransaction(tx as VersionedTransaction)
      : await raydiumSwap.sendLegacyTransaction(tx as Transaction);

    console.log(`https://solscan.io/tx/${txid}`);
  } else {
    const simRes = useVersionedTransaction
      ? await raydiumSwap.simulateVersionedTransaction(tx as VersionedTransaction)
      : await raydiumSwap.simulateLegacyTransaction(tx as Transaction);

    console.log(simRes);
  }
};
