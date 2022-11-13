import * as Secrets from '../../configs/secret';

import { Firestore, deleteDoc, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';

const Keys = {
  users: 'users',
};

interface User {
  uid: string;
  secret: string;
}

export class SignInWeb2Store {
  db!: Firestore;

  async init() {
    if (!Secrets.FirebaseConfig) {
      return false;
    }

    if (this.db) return true;

    const app = initializeApp(Secrets.FirebaseConfig, 'Web2Store');
    this.db = getFirestore(app);

    return true;
  }

  async set(user: { uid: string; secret: string; platform: string }) {
    if (!this.db) return false;

    try {
      await setDoc(doc(this.db, Keys.users, user.uid), user);
      return true;
    } catch (e) {
      console.error('Error adding document: ', e);
    }

    return false;
  }

  async get(uid: string) {
    if (!this.db) return;

    const ref = doc(this.db, Keys.users, uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data() as User;
    }
  }

  async delete(uid: string) {
    if (!this.db) return;

    const ref = doc(this.db, Keys.users, uid);
    await deleteDoc(ref);
  }
}
