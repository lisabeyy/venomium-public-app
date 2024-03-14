import admin from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';

if (!admin.apps.length) {
  admin.initializeApp();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { accountAddress } = req.query;

    const watchlistSnapshot = await admin.firestore().collection('watchlists').doc(accountAddress).get();
    const watchlist = watchlistSnapshot.exists ? watchlistSnapshot.data() : {};

    res.status(200).json(watchlist);
  } catch (error) {
    console.error('Error retrieving watchlist entries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
