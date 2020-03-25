import { UtilsService } from './utils.service';
import { Observable } from 'rxjs';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase';
import { User } from '../model/user';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { HttpClient } from '@angular/common/http';
import { UserData } from '../model/userdata';
import { Platform } from '@ionic/angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  userData: Observable<firebase.User>;

  constructor(
    public afStore: AngularFirestore,
    public ngFireAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    private http: HttpClient,
    private platform: Platform,
    private utilsService: UtilsService,
    private gPlus: GooglePlus
  ) {
    this.userData = this.ngFireAuth.authState;
    this.ngFireAuth.authState.subscribe(user => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    });
  }

  getUser(): Observable<firebase.User> {
    return this.userData;
  }

  getCurrentUser(): firebase.User {
    return this.ngFireAuth.auth.currentUser;
  }

  // Login in with email/password
  signIn(email: string, password: string): Promise<auth.UserCredential> {
    return this.ngFireAuth.auth.signInWithEmailAndPassword(email, password);
  }

  // Register user with email/password
  registerUser(email: string, password: string): Promise<auth.UserCredential> {
    return this.ngFireAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  // Email verification when new user register
  sendVerificationMail(): Promise<void> {
    return this.ngFireAuth.auth.currentUser.sendEmailVerification();
  }

  // Recover password
  passwordRecover(passwordResetEmail: string): Promise<void> {
    return this.ngFireAuth.auth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email has been sent, please check your inbox.');
    }).catch((error) => {
      window.alert(error);
    });
  }

  // Returns true when user is looged in
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }

  // Returns true when user's email is verified
  get isEmailVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Email verified : ' + (user.emailVerified !== false) ? true : false);
    return (user.emailVerified !== false) ? true : false;
  }

  // Sign in with Gmail
  googleAuth(): Promise<void> {
    if (this.platform.is('cordova') || this.platform.is('android')) {
      return this.gPlus.login({
        // webClientId: '1089033813343-7b2vqvrm4j8ocuj3g3dh8ha78ch2bmoq.apps.googleusercontent.com',
        webClientId: '1089033813343-7gi3lt66vrc7v9kgj48ciid8tf4o4sg5.apps.googleusercontent.com',
        scopes: 'profile email'
      }).then((response) => {
        const { accessToken, accessSecret } = response;
        const credential = accessSecret ?
        auth.GoogleAuthProvider.credential(accessToken, accessSecret) : auth.GoogleAuthProvider.credential(accessToken);
        return this.ngFireAuth.auth.signInWithCredential(credential).then((result) => {
          this.ngZone.run(() => {
            this.router.navigate(['profile']);
          });
          this.setUserData(result.user);
        }, (err) => {
          this.utilsService.showToaster('Erreur auth : ' + err, 5000);
        });
      }, (err) => {
        this.utilsService.showToaster('Erreur gPlus : ' + err, 5000);
      });
    } else {
      return this.ngFireAuth.auth.signInWithPopup(new auth.GoogleAuthProvider())
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['profile']);
        });
        this.setUserData(result.user);
      }).catch((error) => {
        window.alert(error);
      });
    }
  }

  // Store user in localStorage
  setUserData(user): Promise<void> {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
    return userRef.set(userData, {
      merge: true
    });
  }

  // Sign-out
  signOut(): Promise<void> {
    return this.ngFireAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['login']);
    });
  }

  getAllUsers(): Observable<UserData[]> {
    return this.http.get<UserData[]>('https://us-central1-todolist-8b030.cloudfunctions.net/api');
  }
}
