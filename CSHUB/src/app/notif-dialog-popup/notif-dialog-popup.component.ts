import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms'
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { Notification } from '../store/models/notification.model';
import { Store } from '@ngrx/store';
import { AppState } from '../store/models/app-state.model';
import { AddNotifAction } from '../store/actions/user.actions';
import { Error } from '../store/models/error.model';

@Component({
  selector: 'app-notif-dialog-popup',
  templateUrl: './notif-dialog-popup.component.html',
  styleUrls: ['./notif-dialog-popup.component.css']
})
export class NotifDialogPopupComponent implements OnInit {

  displayedColumns = ['Select', 'Date'];
  //data = Object.assign(ELEMENT_DATA);
  user_notifs: Array<String>;
  data = []
  dataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  notifFormGroup: FormGroup;
  minDate = new Date();
  errorHTML = "";
  loading$: Observable<Boolean>;
  error$: Observable<Error>;
  add_notif: Notification = {_id: null, datetime: null};
  subscription: Subscription;

  success: boolean;
  success$: Observable<boolean>;


  constructor(private fb: FormBuilder, private store: Store<AppState>) { }

  ngOnInit() {

    this.notifFormGroup = this.fb.group({
      ampm: ['', [
        Validators.required,
      ]],
      minute: ['', [
        Validators.required,
      ]],
      hour: ['', [
        Validators.required,
      ]],
      dateTime: [{ value: new Date(), disabled: true }, [
        Validators.required,
      ]],

    }, { validator: timeValidator });


    this.success$ = this.store.select(store => store.user.notificationSuccess)

    this.subscription = this.store.select(store => store.user).subscribe(state =>   {
      if (state){
        this.user_notifs = state.user.notifications;
        this.add_notif._id = state.user._id;
        this.data = this.user_notifs;
        let dataArray = Object.assign({}, this.user_notifs)
        this.data = Object.keys(dataArray).map(key => (
          {id: Number(key), 
            displayDate: moment(new Date(dataArray[key])).format(("dddd, MMMM Do YYYY, h:mm a")) ,
            name: dataArray[key]}));
        console.log(this.data)
        this.dataSource = new MatTableDataSource(this.data);
      }
      }); 

  }

  get minute() {
    return this.notifFormGroup.get('minute').value;
  }

  get hour() {
    return this.notifFormGroup.get('hour').value;
  }

  get ampm() {
    return this.notifFormGroup.get('ampm').value;
  }

  get dateTime() {
    return this.notifFormGroup.get('dateTime').value;
  }

  //  send new email click ok
  onCreateClick() {

    this.errorHTML = "";

    try {
      this.dateTime.setSeconds(0);
      this.dateTime.setMinutes(parseInt(this.minute));
      this.dateTime.setHours(parseInt(this.hour));

      if (this.ampm == "PM") {
        this.dateTime.setHours(parseInt(this.hour) + 12);
      }
      else {
        this.dateTime.setHours(parseInt(this.hour));
      }

      if (this.user_notifs.length == 3)
        this.errorHTML = `A maximum of 2 notifications are allowed at once`;

      else if (this.user_notifs.includes(this.dateTime.toString()))
        this.errorHTML = `You already have a notification for this date`;
      else{
    
        this.add_notif.datetime = this.dateTime.toString()
        this.loading$ = this.store.select(store => store.user.loading)
        this.store.dispatch(new AddNotifAction(this.add_notif));
        this.error$ = this.store.select(store => store.user.notificationError)
      }
      

    }
    catch (ex) {
      this.errorHTML = `An error as occured.`;

    }

  }

  displayDateTime(){
    return moment(this.dateTime).format(("dddd, MMMM Do YYYY, h:mm a"))
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  removeSelectedRows() {

    this.selection.selected.forEach(item => {
      let index: number = this.data.findIndex(d => d === item);
      console.log(this.data.findIndex(d => d === item));
      this.data.splice(index, 1)
      this.dataSource = new MatTableDataSource(this.data);
    });
    this.selection = new SelectionModel(true, []);
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }


  // check to see if datetimetime has not past yet on every input
  onTimeInput() {
    if (this.notifFormGroup.hasError('timeNotValid'))
    this.notifFormGroup.setErrors([{ 'timeNotValid': true }]);
    else
      this.notifFormGroup.setErrors(null);
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();

  }

}

// check to see if the datetime has not past yet
export const timeValidator: ValidatorFn = (timeFormGroup: FormGroup): ValidationErrors | null => {
  try{
    let dateTime = new Date(timeFormGroup.get('dateTime').value.getTime());
    let minute = timeFormGroup.get('minute').value;
    let hour = timeFormGroup.get('hour').value;
    let ampm = timeFormGroup.get('ampm').value;


    dateTime.setSeconds(0);
    dateTime.setMinutes(parseInt(minute));
    dateTime.setHours(parseInt(hour));

    if (ampm == "PM") {
      dateTime.setHours(parseInt(hour) + 12);
    }
    else {
      dateTime.setHours(parseInt(hour));
    }

    if (dateTime > new Date())
      return null;
    else
      return { timeNotValid: true };
    }
    catch(ex){
      return null;
    }

};