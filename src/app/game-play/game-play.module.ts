import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from  '../shared/shared.module';
import { GamePlayRoutingModule } from  './routing/game-play-routing.module';
import { NewGameComponent, GameComponent, 
         GameQuestionComponent, GameQuestionContinueComponent,
         GameOverComponent, GameDialogComponent } from  './components';
import { effects, reducer } from  './store';

@NgModule({
  declarations: [
    NewGameComponent,
    GameComponent,
    GameQuestionComponent,
    GameQuestionContinueComponent,
    GameOverComponent,
    GameDialogComponent
  ],
  entryComponents: [
    GameDialogComponent
  ],
  imports: [
    //rwa modules
    SharedModule,
    GamePlayRoutingModule,

    //ngrx feature store
    StoreModule.forFeature('gameplay', reducer),

    //ngrx effects
    EffectsModule.forFeature(effects),

  ],
  providers: [ 
  ]
})
export class GamePlayModule { }
