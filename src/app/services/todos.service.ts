import { Injectable } from '@angular/core';
import { Todo } from '../model/todo';
import { AngularFirestoreDocument, AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TodosService {

  private todosCollection: AngularFirestoreCollection<Todo>;

  private todos: Observable<Array<Todo>>;

  constructor(private db: AngularFirestore) {
  
   }

  initialize(id) : void {
    this.todosCollection = this.db.collection<Todo>('todos'+id);
    this.todos = this.todosCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }

  get(): Observable<Array<Todo>> {
    return this.todos;
  }

  add(todo: Todo) {
    return this.todosCollection.add(todo);
  }

  delete(todo: Todo){
    return this.todosCollection.doc(todo.id).delete();
  }
}
