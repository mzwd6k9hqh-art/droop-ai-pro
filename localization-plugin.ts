import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import type { Plugin } from 'vite';

// Compile app-owned JSX copy through the shared catalog. No DOM mutations:
// React keeps ownership of nodes, state, dialogs, and input values.
export function localizationPlugin(): Plugin {
  const traverse = (traverseModule as unknown as { default?: typeof traverseModule }).default || traverseModule;
  return {
    name: 'zyra-ui-localization', enforce: 'pre',
    transform(source, id) {
      const file = id.split('?')[0];
      if (!file.endsWith('.tsx') || !file.includes('/src/') || /\/(contexts|integrations|test)\/|\/(ui|ai-elements)\/|\.(test|spec)\.|StorePreview\.tsx/.test(file)) return null;
      const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
      const edits: { start: number; end: number; value: string }[] = [];
      const components = new Set<number>();
      const add = (node: { start?: number | null; end?: number | null }, value: string) => {
        if (node.start != null && node.end != null) edits.push({ start: node.start, end: node.end, value });
      };
      const copyAttributes = new Set(['title', 'description', 'placeholder', 'aria-label', 'alt', 'label']);
      const preserve = /(?:\b(?:user|conv|conversation|item|product|customer|message|msg|att|variant|storeConfig|config)\.(?:name|email|text|title|content|description|storeName)|\b(?:content|value|newMemory|partial|lastUser|userContent|storeName|description)\b)/;
      traverse(ast, {
        Function(path) {
          const node = path.node;
          const name = 'id' in node && node.id?.type === 'Identifier' ? node.id.name : path.parent.type === 'VariableDeclarator' && path.parent.id.type === 'Identifier' ? path.parent.id.name : '';
          if (!/^[A-Z]/.test(name) || node.body.type !== 'BlockStatement') return;
          let jsx = false;
          path.traverse({ JSXElement() { jsx = true; }, JSXFragment() { jsx = true; } });
          if (jsx && node.body.start != null) components.add(node.body.start + 1);
        },
        JSXText(path) {
          const text = path.node.value.replace(/\s+/g, ' ').trim();
          if (!text || !/[\p{L}]/u.test(text) || text === 'ZYRA') return;
          const leading = /^\s/.test(path.node.value) ? ' ' : '';
          const trailing = /\s$/.test(path.node.value) ? ' ' : '';
          add(path.node, `{__zyraTranslate(${JSON.stringify(leading + text + trailing)})}`);
        },
        JSXAttribute(path) {
          if (path.node.name.type !== 'JSXIdentifier' || !copyAttributes.has(path.node.name.name)) return;
          if (path.node.value?.type === 'StringLiteral') add(path.node.value, `{__zyraTranslate(${JSON.stringify(path.node.value.value)})}`);
        },
        JSXExpressionContainer(path) {
          const expression = path.node.expression;
          if (expression.type === 'JSXEmptyExpression' || expression.start == null || expression.end == null) return;
          if (path.parent.type === 'JSXAttribute' && (path.parent.name.type !== 'JSXIdentifier' || !copyAttributes.has(path.parent.name.name))) return;
          if (['JSXElement', 'JSXFragment', 'ArrowFunctionExpression', 'ObjectExpression', 'CallExpression'].includes(expression.type)) return;
          const text = source.slice(expression.start, expression.end);
          if (preserve.test(text)) return;
          add(expression, `__zyraTranslate(${text})`);
        },
        CallExpression(path) {
          const callee = path.node.callee;
          if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier' || callee.object.name !== 'toast') return;
          const arg = path.node.arguments[0];
          if (arg?.type === 'StringLiteral') add(arg, `__zyraTranslate(${JSON.stringify(arg.value)})`);
        },
      });
      if (!edits.length) return null;
      for (const start of components) edits.push({ start, end: start, value: '\n__zyraLanguageVersion();\n' });
      let result = source;
      let boundary = source.length + 1;
      for (const edit of edits.sort((a, b) => b.start - a.start)) {
        if (edit.end > boundary) continue;
        result = result.slice(0, edit.start) + edit.value + result.slice(edit.end);
        boundary = edit.start;
      }
      return { code: `import {translateUiText as __zyraTranslate} from '@/lib/uiLanguage';\nimport {useUiLanguageVersion as __zyraLanguageVersion} from '@/lib/useUiLanguage';\n${result}`, map: null };
    },
  };
}