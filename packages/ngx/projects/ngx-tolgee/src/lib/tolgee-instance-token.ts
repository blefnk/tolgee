import { InjectionToken } from '@angular/core';
import { TolgeeInstance } from '@tolgee/web';

export const TOLGEE_INSTANCE = new InjectionToken<TolgeeInstance>(
  'tolgee.instance'
);
