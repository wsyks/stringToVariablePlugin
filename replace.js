const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const { transformFromAstSync } = require('@babel/core');
const plugin = require('./plugin');

function transformCode(source) {
  // 使用@babel/parser解析代码
  const ast = parser.parse(source, {
    sourceType: 'module',
    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
    plugins: [
      'jsx',
      'classProperties',
      'typescript',
      'moduleStringNames',
      'exportNamespaceFrom',
      'exportDefaultFrom',
      'dynamicImport',
      'asyncGenerators',
      ['decorators', { decoratorsBeforeExport: !1 }],
      'asyncDoExpressions',
      'doExpressions',
      'functionBind',
      'throwExpressions',
    ],
  });
  const { code } = transformFromAstSync(ast, source, {
    plugins: [[plugin, {}]],
  });
  return code;
}

async function exe() {
  let filePath = process.argv[2];
  filePath = path.join(__dirname, filePath);

  const sourceCode = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  });

  const newCode = transformCode(sourceCode);
  fs.writeFileSync(filePath, newCode);
  console.log('替换完毕！');
}

exe();
