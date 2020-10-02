import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {convertSnaps} from './db-utils';
import {first, map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UnitsService {

    constructor(private db: AngularFirestore) {
    }

    loadAllUnits(): Observable<any[]> {
        return this.db.collection('units').snapshotChanges().pipe(
            map(snaps => convertSnaps<any>(snaps)),
            first());
    }
}
