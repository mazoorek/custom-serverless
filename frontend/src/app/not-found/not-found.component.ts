import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'not-found',
  template: `
  <div class="not-found-container">
    <div>404</div>
    <div>Page not found</div>
  </div>
  `,
  styleUrls: ['not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {

}
