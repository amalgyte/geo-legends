import { Injectable } from '@angular/core';
import {
  Database,
  ref,
  set,
  push,
  get,
  update,
  remove,
} from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private db: Database) {}

  create(path: string, data: any): Promise<void> {
    const newRef = push(ref(this.db, path));
    return set(newRef, data);
  }

  read(path: string): Promise<any> {
    return get(ref(this.db, path)).then((snapshot) => snapshot.val());
  }

  update(path: string, data: any): Promise<void> {
    return update(ref(this.db, path), data);
  }

  delete(path: string): Promise<void> {
    return remove(ref(this.db, path));
  }
}
