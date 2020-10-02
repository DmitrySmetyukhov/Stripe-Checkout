import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {auth} from 'firebase';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public state: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        public afAuth: AngularFireAuth,
        public router: Router
    ) {
        this.afAuth.authState.subscribe((state: any) => {
            console.log(state, 'state***');
            this.state.next(state);
        });
    }

    authLogin(provider) {
        return this.afAuth
            .signInWithPopup(provider)
            .then((result) => {
                this.router.navigate(['home']);
            })
            .catch((error) => {
                console.log(error, 'err**');
            });
    }

    googleAuth() {
        return this.authLogin(new auth.GoogleAuthProvider());
    }

    public logout() {
        this.afAuth.signOut().then(async () => {
            this.router.navigate(['auth']);
        });
    }
}
