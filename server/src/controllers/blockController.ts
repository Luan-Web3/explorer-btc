import { Request, Response } from 'express';
import bitcoinClient from '../services/bitcoinService';

export const getLatestBlocks = async (req: Request, res: Response) => {
    try {
        const blockCount = await bitcoinClient.getBlockCount();
        const lastBlocksCount = blockCount >= 5 ? 5 : blockCount;

        const blockPromises = [];
        for (let i = blockCount; i > blockCount - lastBlocksCount; i--) {
            blockPromises.push(bitcoinClient.getBlockHash(i));
        }

        const blockHashes = await Promise.all(blockPromises);

        const blockDetailsPromises = blockHashes.map((hash) =>
            bitcoinClient.getBlock(hash)
        );
        const blocks = await Promise.all(blockDetailsPromises);

        res.json(blocks);
    } catch (error) {
        console.error('Erro ao buscar os últimos blocos:', error.message);
        res.status(500).json({ error: 'Erro ao buscar os últimos blocos' });
    }
};

export const getBlockByHeight = async (req: Request, res: Response) => {
    try {
        const { height } = req.params;
        const hash = await bitcoinClient.command('getblockhash', parseInt(height));
        const block = await bitcoinClient.command('getblock', hash);
        res.json(block);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}