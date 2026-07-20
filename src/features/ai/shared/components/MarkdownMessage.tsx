import type { ReactNode } from 'react';

interface MarkdownMessageProps {
  content: string;
}

type MarkdownBlock =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] };

const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const plainUrlPattern = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?])/g;

function flushParagraph(blocks: MarkdownBlock[], lines: string[]) {
  if (lines.length > 0) {
    blocks.push({ type: 'paragraph', lines: [...lines] });
    lines.length = 0;
  }
}

function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const paragraphLines: string[] = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(blocks, paragraphLines);
      continue;
    }

    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph(blocks, paragraphLines);
      blocks.push({
        type: 'heading',
        level: heading[1].length as 2 | 3,
        text: heading[2],
      });
      continue;
    }

    const unorderedItem = /^[-*]\s+(.+)$/.exec(line);
    if (unorderedItem) {
      flushParagraph(blocks, paragraphLines);
      const previous = blocks.at(-1);
      if (previous?.type === 'unordered-list') {
        previous.items.push(unorderedItem[1]);
      } else {
        blocks.push({ type: 'unordered-list', items: [unorderedItem[1]] });
      }
      continue;
    }

    const orderedItem = /^\d+[.)]\s+(.+)$/.exec(line);
    if (orderedItem) {
      flushParagraph(blocks, paragraphLines);
      const previous = blocks.at(-1);
      if (previous?.type === 'ordered-list') {
        previous.items.push(orderedItem[1]);
      } else {
        blocks.push({ type: 'ordered-list', items: [orderedItem[1]] });
      }
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph(blocks, paragraphLines);
  return blocks;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(markdownLinkPattern)) {
    if (match.index === undefined) continue;

    if (match.index > cursor) {
      nodes.push(...renderPlainText(text.slice(cursor, match.index)));
    }

    nodes.push(
      <a
        key={`md-link-${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
      >
        {match[1]}
      </a>,
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(...renderPlainText(text.slice(cursor)));
  }

  return nodes;
}

function renderPlainText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(plainUrlPattern)) {
    if (match.index === undefined) continue;

    if (match.index > cursor) {
      nodes.push(...renderBoldText(text.slice(cursor, match.index)));
    }

    nodes.push(
      <a
        key={`url-${match.index}`}
        href={match[0]}
        target="_blank"
        rel="noreferrer"
      >
        {match[0]}
      </a>,
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(...renderBoldText(text.slice(cursor)));
  }

  return nodes;
}

function renderBoldText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];

  text.split(/(\*\*[^*]+\*\*)/g).forEach((part, index) => {
    if (!part) return;
    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(<strong key={`strong-${index}`}>{part.slice(2, -2)}</strong>);
      return;
    }
    nodes.push(part);
  });

  return nodes;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="message__text message__markdown">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Heading = block.level === 2 ? 'h2' : 'h3';
          return (
            <Heading key={`${block.type}-${index}`}>
              {renderInlineMarkdown(block.text)}
            </Heading>
          );
        }

        if (block.type === 'unordered-list') {
          return (
            <ul key={`${block.type}-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ordered-list') {
          return (
            <ol key={`${block.type}-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block.type}-${index}`}>
            {block.lines.map((line, lineIndex) => (
              <span key={`${line}-${lineIndex}`}>
                {lineIndex > 0 && <br />}
                {renderInlineMarkdown(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
