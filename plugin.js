const generator = require('@babel/generator').default;
module.exports = function (babel) {
  const { types: t } = babel;
  const stringValue = '客户';
  const regex = new RegExp(stringValue, 'g');
  return {
    visitor: {
      Program(path) {
        let lastImportIndex = -1;
        let hasImport = false;
        path.traverse({
          ImportDeclaration(path) {
            lastImportIndex = path.key;
            if (path?.node?.source.value === '@/constants/version') {
              hasImport = true;
            }
          },
        });
        if (hasImport) return;
        const importStatement = t.importDeclaration(
          [t.importSpecifier(t.identifier('CUSTOMER_LABEL'), t.identifier('CUSTOMER_LABEL'))],
          t.stringLiteral('@/constants/version'),
        );
        if (lastImportIndex > -1) {
          // 在最后一个 import 语句后面插入新的 import 语句
          path.get('body')[lastImportIndex].insertAfter(importStatement);
        } else {
          path.unshiftContainer('body', importStatement);
        }
      },
      StringLiteral(path) {
        const { node } = path;
        // 判断字符串中是否包含"客户"
        if (node.value.includes(stringValue)) {
          if (t.isJSXAttribute(path.parent)) {
            const elementList = node.value.split(stringValue);
            const newElementList = elementList.map((item, index) =>
              index === elementList.length - 1
                ? t.templateElement({ raw: item }, true)
                : t.templateElement({ raw: item }),
            );
            const count = (node.value.match(regex) || []).length;
            const templateLiteral = t.templateLiteral(
              newElementList,
              new Array(count).fill(t.identifier('CUSTOMER_LABEL')),
            );
            const jsxExpressionContainer = t.jsxExpressionContainer(templateLiteral);
            path.replaceWith(jsxExpressionContainer);
          } else {
            const elementList = node.value.split(stringValue);
            const newElementList = elementList.map((item, index) =>
              index === elementList.length - 1
                ? t.templateElement({ raw: item }, true)
                : t.templateElement({ raw: item }),
            );
            const count = (node.value.match(regex) || []).length;
            const templateLiteral = t.templateLiteral(
              newElementList,
              new Array(count).fill(t.identifier('CUSTOMER_LABEL')),
            );
            path.replaceWith(templateLiteral);
          }
        }
      },
      TemplateLiteral(path) {
        const { node } = path;
        // 遍历模板字符串中的所有模板元素
        for (let i = 0; i < node.quasis.length; i++) {
          const templateElement = node.quasis[i];
          const { value } = templateElement;

          // 判断模板元素中是否包含"客户"
          if (value.raw.includes(stringValue)) {
            // 将模板元素中的"客户"替换为`${CUSTOMER_LABEL}`
            const updatedValue = value.raw.replace(regex, '${CUSTOMER_LABEL}');

            // 更新模板元素的值
            templateElement.value.raw = updatedValue;
            templateElement.value.cooked = updatedValue;
          }
        }
      },
      JSXElement(path) {
        path.traverse({
          JSXText(textPath) {
            const textValue = textPath.node.value.trim();
            if (textValue.includes(stringValue)) {
              const variable = t.jsxExpressionContainer(t.identifier('CUSTOMER_LABEL'));

              const newText = textValue.replace(stringValue, `${generator(variable).code}`);
              textPath.replaceWith(t.jsxText(newText));
            }
          },
        });
      },
    },
  };
};
