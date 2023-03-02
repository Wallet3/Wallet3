import firestore from '@react-native-firebase/firestore';
import { logDeleteWeb2Secret } from '../services/Analytics';

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
      __DEV__ && console.error('Error adding document: ', e);
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
      logDeleteWeb2Secret(uid);
    } catch (error) {}
  }
}
