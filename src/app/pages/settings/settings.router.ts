import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';

export const routes: Routes = [
    {
        path: '/test',
        component: SettingsComponent,
    }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);