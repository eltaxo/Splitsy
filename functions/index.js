const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../splitsy-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://splitsy-e4209-default-rtdb.firebaseio.com'
});

const db = admin.firestore();

// API para crear gastos
exports.expenses = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    if (req.method === 'POST') {
      const { paidBy, amount, concept, weekStart } = req.body;

      if (!paidBy || !amount || !concept) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }

      // Validar usuario
      const userDoc = await db.collection('users').doc(paidBy).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Crear gasto
      const weekStartDate = weekStart ? new Date(weekStart) : getWeekStart();

      const docRef = await db.collection('expenses').add({
        paidBy,
        amount: parseFloat(amount),
        concept: concept.trim(),
        weekStart: weekStartDate,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        success: true,
        id: docRef.id,
      });
    }

    if (req.method === 'GET') {
      const { userId, partnerId, weekStart } = req.query;

      if (!userId || !partnerId) {
        return res.status(400).json({ error: 'userId y partnerId requeridos' });
      }

      const weekStartDate = weekStart ? new Date(weekStart) : getWeekStart();

      const q = db.collection('expenses')
        .where('paidBy', 'in', [userId, partnerId])
        .where('weekStart', '==', weekStartDate);

      const snapshot = await q.get();
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.json({ expenses });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// API para vincular pareja
exports.partner = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Código y userId requeridos' });
    }

    // Buscar usuario con el código
    const usersSnapshot = await db.collection('users')
      .where('partnerCode', '==', code)
      .get();

    if (usersSnapshot.empty) {
      return res.status(404).json({ error: 'Código no encontrado' });
    }

    const partnerDoc = usersSnapshot.docs[0];
    const partnerData = partnerDoc.data();
    const partnerId = partnerDoc.id;

    // Validaciones
    if (partnerId === userId) {
      return res.status(400).json({ error: 'No puedes usar tu propio código' });
    }

    if (partnerData.partnerId) {
      return res.status(400).json({ error: 'Este código ya está vinculado a otra pareja' });
    }

    // Verificar y crear documento del usuario si no existe
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(400).json({
        error: 'Usuario no encontrado. Por favor, cierra sesión y vuelve a entrar.'
      });
    }

    // Vincular usuarios
    await db.collection('users').doc(userId).update({
      partnerId: partnerId
    });

    await db.collection('users').doc(partnerId).update({
      partnerId: userId
    });

    return res.json({
      success: true,
      partnerId,
      partnerName: partnerData.name,
    });
  } catch (error) {
    console.error('Error al vincular pareja:', error);
    return res.status(500).json({
      error: 'Error al vincular pareja',
      details: error.message
    });
  }
});

// Helper function
function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}