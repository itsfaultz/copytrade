import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { sendRaydium, loadPoolKeys } from './sendRaydium';

let cachedPoolKeys: any = null; // Define cachedPoolKeys at the top

// Create an Express application
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to handle Raydium swap
app.post('/raydiumSwap', async (req: Request, res: Response) => {
  const {
    slippage,
    quoteMint,
    useVersionedTransaction,
    tokenAAmount,
    baseMint,
    WALLET_PRIVATE_KEY,
    RPC_URL,
    priorityFees,
    executeSwap,
  } = req.body;

  try {
    // Ensure pool keys are loaded
    if (!cachedPoolKeys) {
      await loadPoolKeys(RPC_URL, WALLET_PRIVATE_KEY);
    }

    // Call the sendRaydium function with the provided parameters
    const result = await sendRaydium({
      slippage,
      quoteMint,
      useVersionedTransaction,
      tokenAAmount,
      baseMint,
      WALLET_PRIVATE_KEY,
      RPC_URL,
      priorityFees,
      executeSwap,
    });

    // Send the result back to the client
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
