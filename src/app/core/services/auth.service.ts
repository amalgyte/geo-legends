import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  browserLocalPersistence,
  setPersistence,
} from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private roleSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    setPersistence(this.auth, browserLocalPersistence).catch((error) =>
      console.error('Error setting persistence:', error)
    );

    this.auth.onAuthStateChanged(async (user) => {
      this.userSubject.next(user);
      if (user) {
        const role = await this.getUserRole(user.uid);
        this.roleSubject.next(role);
      } else {
        this.roleSubject.next(null);
      }
    });
  }

  get user$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  get role$(): Observable<string | null> {
    return this.roleSubject.asObservable();
  }

  loginWithEmail(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(async () => {
        const user = this.auth.currentUser;
        if (user) {
          const role = await this.getUserRole(user.uid);
          this.roleSubject.next(role);
  
          // Redirect based on role
          const redirectTo = this.router.getCurrentNavigation()?.extras.queryParams?.['redirectTo'] || '/game';
          if (role === 'admin' && redirectTo === '/admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/game']);
          }
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        throw error;
      });
  }
  
  loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
      .then(async () => {
        const user = this.auth.currentUser;
        if (user) {
          const role = await this.getUserRole(user.uid);
          this.roleSubject.next(role);
  
          // Redirect based on role
          const redirectTo = this.router.getCurrentNavigation()?.extras.queryParams?.['redirectTo'] || '/game';
          if (role === 'admin' && redirectTo === '/admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/game']);
          }
        }
      })
      .catch((error) => {
        console.error('Google login error:', error);
        throw error;
      });
  }
  

  logout(): Promise<void> {
    return signOut(this.auth).then(() => console.log('User logged out'));
  }

  private async getUserRole(uid: string): Promise<string | null> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const userSnapshot = await getDoc(userDoc);
    return userSnapshot.exists() ? (userSnapshot.data() as any).role : null;
  }
}
