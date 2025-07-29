import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { fakeBackendProvider } from './app/_helpers/fake-backend';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './app/_helpers/jwt.interceptor';
import { NgModule } from '@angular/core';

bootstrapApplication(AppComponent, {
  ...appConfig, 
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    //fakeBackendProvider
    
  ]

  
}).catch((err) => console.error(err));

@NgModule({
  // ...
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    // other providers
  ],
})
export class AppModule { }
