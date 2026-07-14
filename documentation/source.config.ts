import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

import { remarkMdxMermaid } from 'fumadocs-mermaid';

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        {
          name: 'diff-copy-transformer',
          line(node) {
            if (this.options.lang !== 'diff') return;

            const firstChild = node.children[0];
            if (firstChild && firstChild.type === 'element') {
              const textNode = firstChild.children[0];
              if (textNode && textNode.type === 'text') {
                const text = textNode.value;
                if (text.startsWith('+') || text.startsWith('-') || text.startsWith(' ')) {
                  const sign = text[0];
                  textNode.value = text.slice(1);

                  node.children.unshift({
                    type: 'element',
                    tagName: 'span',
                    properties: {
                      className: ['select-none', 'opacity-50', 'mr-2']
                    },
                    children: [{ type: 'text', value: sign }]
                  });
                }
              }
            }
          }
        }
      ]
    }
  },
});
