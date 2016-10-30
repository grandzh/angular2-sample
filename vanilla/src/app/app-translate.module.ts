import { NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader, MissingTranslationHandler } from 'ng2-translate';

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(key: string) {
      return 'missing key: [' + key + ']';
  }
}

// class CustomLoader implements TranslateLoader {
//     getTranslation(lang: string): Observable<any> {
//         return Observable.of({"KEY": "Value"});
//     }
// }
// TranslateModule.forRoot({ provide: TranslateLoader, useClass: CustomLoader })

@NgModule({
  imports: [
    HttpModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
      deps: [Http]
    })
    ],
  exports: [TranslateModule],
  providers: [{ provide: MissingTranslationHandler, useClass: MyMissingTranslationHandler }],
})
export class AppTranslateModule { }