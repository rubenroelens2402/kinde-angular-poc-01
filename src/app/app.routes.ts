import { ExtraOptions, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { BrowserUtils } from '@azure/msal-browser';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'profile',
        component: ProfileComponent,
    }
];
