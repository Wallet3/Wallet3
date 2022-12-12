import FirebaseAnalytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Keys = {
  users: 'users',
  store: 'Web2Store',
};

interface User {
  uid: string;
  secret: string;
}

export class SignInWeb2Store {
  async set(user: { uid: string; secret: string; platform: string }) {
    try {
      await firestore().collection(Keys.users).doc(user.uid).set(user);
      return true;
    } catch (e) {
      console.error('Error adding document: ', e);
    }

    return false;
  }

  async get(uid: string) {
    const doc = await firestore().collection(Keys.users).doc(uid).get();
    if (doc.exists) return doc.data() as User;
  }

  async delete(uid: string) {
    try {
      await firestore().collection(Keys.users).doc(uid).delete();
      FirebaseAnalytics().logEvent('delete_sign_with_web2_secret', {
        platform: Platform.OS,
        uid,
        timestamp: new Date().toISOString(),
        timezone: `${-(new Date().getTimezoneOffset() / 60)}`,
      });
    } catch (error) {}
  }
}
