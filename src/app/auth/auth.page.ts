import { Component, OnInit } from '@angular/core';
import {AuthService} from '../shared/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }


  public googleLogin() {
    this.authService.googleAuth();
  }

}
