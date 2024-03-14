import admin from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';

if (!admin.apps.length) {
  admin.initializeApp();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accountAddress, walletAddress, label } = req.body;

    const watchlistRef = admin.firestore().collection('watchlists').doc(accountAddress);
    await watchlistRef.set({
      [walletAddress]: { label, walletAddress, createdAt: new Date()},
    }, { merge: true });

    res.status(201).json({ message: 'Watchlist entry created successfully' });
  } catch (error) {
    console.error('Error creating watchlist entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
