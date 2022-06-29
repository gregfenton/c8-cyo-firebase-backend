import functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('FUNCTIONLOG: Hello logs!', { structuredData: true });
  console.log('GREGLOG: Hello logs!');
  response.send('Hello from Firebase!');
});

const app = initializeApp(); // uses current Firebase project’s config
const firestore = getFirestore(app);

export const getNumberOfHeroes = functions.https.onCall(
  async (data, context) => {
    try {
      let aggDocRef = firestore.doc('stats/heroes');
      let docSnap = await aggDocRef.get(aggDocRef);
      let theCount = docSnap.data().count;
      functions.logger.log(`request from: ${context.auth.token.email}`);
      functions.logger.log(`num of heroes: ${theCount}`);
      return { numHeroes: theCount };
    } catch (ex) {
      functions.logger.info(`ERROR: ${ex.message}`);
      throw ex;
    }
  }
);

export const initializeNewInfluencer = functions.https.onCall(
  async (data, context) => {
    try {
      let theUid = context.auth.uid;
      let theEmail = context.auth.token.email;
      console.log(`the UID is:`, theUid);

      console.log(`the data is:`, data);
      let theStartTime = data.startTime;
      let theMeetingLength = data.meetingLength;
      let theNumMeetings = data.numMeetings;

      for (let i = 0; i < theNumMeetings; i++) {
        let meetingCollRef = firestore.collection('meetings');
        let docSnap = await meetingCollRef.add({
          uid: theUid,
          email: theEmail,
          startTime: theStartTime + i * theMeetingLength / 60,
        });
        console.log(`the new doc ID is:`, docSnap.id);
      }
    } catch (ex) {
      functions.logger.info(`ERROR: ${ex.message}`);
      throw ex;
    }
  }
);

export const fsHeroesOnCreate = functions.firestore
  .document('heroes/{docId}')
  .onCreate(async (docSnap, context) => {
    try {
      const newHero = docSnap.data();
      functions.logger.log(`new hero! ${newHero.name}`);
      const aggDocRef = firestore.doc('stats/heroes');
      return aggDocRef.update({
        count: admin.firestore.FieldValue.increment(1),
      });
    } catch (ex) {
      functions.logger.info(`ERROR: ${ex.message}`);
      throw ex;
    }
  });
