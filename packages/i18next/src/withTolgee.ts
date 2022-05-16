/* eslint-disable @typescript-eslint/no-var-requires */
import { Tolgee, TolgeeConfig } from '@tolgee/core';
import { Callback, i18n, InitOptions } from 'i18next';
import { tolgeeApply } from './tolgeeApply';
import { tolgeeBackend } from './tolgeeBackend';
import { tolgeeOptions } from './tolgeeOptions';
import { tolgeeProcessor } from './tolgeeProcessor';

export const withTolgee = (i18n: i18n, config: TolgeeConfig) => {
  const originalInit = i18n.init;
  const newInit: typeof originalInit = (...params) => {
    let options: InitOptions = {};
    let callback: Callback | undefined = undefined;

    if (typeof params[0] === 'object') {
      options = params[0] as InitOptions;
      callback = params[1] as Callback;
    } else {
      callback = params[0] as Callback;
    }

    const updatedOptions = {
      defaultNS: 'root',
      ns: ['root'],
      ...options,
    };

    const tolgee = Tolgee.init({
      wrapperMode: 'invisible',
      enableLanguageDetection: false,
      enableLanguageStore: false,
      ns: updatedOptions.ns
        ? Array.isArray(updatedOptions.ns)
          ? updatedOptions.ns
          : [updatedOptions.ns]
        : undefined,
      defaultNS: updatedOptions.defaultNS,
      ui:
        process.env.NODE_ENV !== 'development'
          ? undefined
          : typeof require !== 'undefined'
          ? require('@tolgee/ui')
          : import('@tolgee/ui'),
      ...config,
    });
    i18n.use(tolgeeBackend(tolgee));
    i18n.use(tolgeeProcessor(tolgee));

    tolgeeApply(tolgee, i18n);

    const newOptions = tolgeeOptions(tolgee, updatedOptions);
    const result = originalInit(newOptions, callback);
    const language = i18n.language || options.lng;
    if (language) {
      tolgee.lang = language;
    }
    tolgee.run();
    return result;
  };
  i18n.init = newInit;
  return i18n;
};
