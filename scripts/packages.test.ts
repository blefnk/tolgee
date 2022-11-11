import fs from 'fs';
import path from 'path';
import { expect } from '@jest/globals';

import { searchRecursively } from './searchRecursively';

const assertExpr = (expr, message) => {
  it(message, () => {
    expect(Boolean(expr)).toBe(true);
  });
};

const fileExists = (dir, filePath) => {
  const absolutePath = path.join(dir, filePath);
  return fs.existsSync(absolutePath);
};

const assertFileExists = (dir, filePath, message) => {
  if (filePath) {
    const absolutePath = path.join(dir, filePath);
    assertExpr(fs.existsSync(absolutePath), ` - ${message}: ${filePath}`);
  }
};

const checkedPackages = [];

const checkPackage = (filePath) => {
  const folder = path.dirname(filePath);
  const f = JSON.parse(fs.readFileSync(filePath).toString());

  if (f.private == true) {
    return;
  }

  if (f.publishConfig?.directory) {
    describe(`${f.name} -> ${f.publishConfig.directory}`, () => {
      assertFileExists(folder, f.publishConfig.directory, 'exists');
      if (fileExists(folder, f.publishConfig.directory)) {
        const pckg = path.join(
          folder,
          f.publishConfig.directory,
          'package.json'
        );
        if (!checkedPackages.includes(pckg)) {
          checkedPackages.push(pckg);
          checkPackage(pckg);
        }
      }
    });
    return;
  }

  describe(f.name, () => {
    assertExpr(f.name.startsWith('@tolgee/'), 'Has correct name');
    assertExpr(f.publishConfig?.access, 'Is public');
    assertExpr(f.main || f.module || f.exports, 'Has entry point');
    assertFileExists(folder, f.main, 'main');
    assertFileExists(folder, f.module, 'module');
    if (f.module) {
      // if module field ends with .mjs it causes issues with webpack
      assertExpr(f.module.endsWith('.js'), ' - module ends with .js');
    }
    assertFileExists(folder, f.types, 'types');
    Object.entries(f.exports || {}).forEach(([key, target]) => {
      assertFileExists(
        folder,
        target,
        path.join('exports', key).replace('/', '.')
      );
    });

    assertFileExists(
      folder,
      f.publishConfig?.directory,
      'publishConfig.directory'
    );
  });
};

const files = searchRecursively('./packages', 'package.json', [], 4);
files.forEach((filePath) => {
  checkPackage(filePath);
});
