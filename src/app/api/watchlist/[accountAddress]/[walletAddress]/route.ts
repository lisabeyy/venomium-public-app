import admin from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';

if (!admin.apps.length) {
  admin.initializeApp();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { walletAddress } = req.query;

  if (req.method === 'GET') {
    // Handle GET request to fetch watchlist entry for the given walletAddress
    try {
      const watchlistsSnapshot = await admin.firestore().collection('watchlists').where(`walletAddress.${walletAddress}`, '==', true).get();
      const watchlists = watchlistsSnapshot.docs.map(doc => doc.data());

      res.status(200).json(watchlists);
    } catch (error) {
      console.error('Error retrieving watchlist entries:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'PUT') {
    // Handle PUT request to update watchlist entry for the given walletAddress
    try {
      const { label } = req.body;

      const watchlistSnapshot = await admin.firestore().collection('watchlists').where(`walletAddress.${walletAddress}`, '==', true).get();
      if (watchlistSnapshot.empty) {
        return res.status(404).json({ error: 'Watchlist entry not found' });
      }

      const watchlistDoc = watchlistSnapshot.docs[0];
      await watchlistDoc.ref.update({ label });

      res.status(200).json({ message: 'Watchlist entry updated successfully' });
    } catch (error) {
      console.error('Error updating watchlist entry:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'DELETE') {
    // Handle DELETE request to delete watchlist entry for the given walletAddress
    try {
      const watchlistSnapshot = await admin.firestore().collection('watchlists').where(`walletAddress.${walletAddress}`, '==', true).get();
      if (watchlistSnapshot.empty) {
        return res.status(404).json({ error: 'Watchlist entry not found' });
      }

      const watchlistDoc = watchlistSnapshot.docs[0];
      await watchlistDoc.ref.delete();

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting watchlist entry:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
