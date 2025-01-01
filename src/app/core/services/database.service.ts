import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "@angular/fire/firestore";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  constructor(private firestore: Firestore) {}

  async create(collectionPath: string, data: any): Promise<string> {
    const colRef = collection(this.firestore, collectionPath);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  }

  async read(collectionPath: string, docId: string): Promise<any> {
    const docRef = doc(this.firestore, `${collectionPath}/${docId}`);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  }

  async readCollection(collectionPath: string): Promise<any[]> {
    const colRef = collection(this.firestore, collectionPath);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async update(
    collectionPath: string,
    docId: string,
    data: any
  ): Promise<void> {
    const docRef = doc(this.firestore, `${collectionPath}/${docId}`);
    await updateDoc(docRef, data);
  }

  async delete(collectionPath: string, docId: string): Promise<void> {
    const docRef = doc(this.firestore, `${collectionPath}/${docId}`);
    await deleteDoc(docRef);
  }
}
