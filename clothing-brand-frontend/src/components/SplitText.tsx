import { Fragment, type ElementType } from 'react';

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  id?: string;
}

/**
 * Headline whose words rise from a mask when scrolled into view.
 * Wrap words in *asterisks* for italics; "\n" forces a line break.
 */
const SplitText = ({ text, as: Tag = 'h2', className = '', delay = 0, id }: Props) => {
  let index = 0;
  const lines = text.split('\n');
  return (
    <Tag className={`rc-splittext ${className}`} data-reveal="" aria-label={text.replace(/\*/g, '').replace(/\n/g, ' ')} id={id} style={{ '--split-delay': `${delay}ms` } as React.CSSProperties}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {line.split(/(\*[^*]+\*)/).filter(Boolean).flatMap((chunk, ci) => {
            const italic = chunk.startsWith('*');
            return chunk.replace(/\*/g, '').split(' ').filter(Boolean).map((word, wi) => (
              <Fragment key={`${ci}-${wi}`}>
                {(ci > 0 || wi > 0) && ' '}
                <span className="rc-split__w" aria-hidden>
                  <span style={{ '--i': index++ } as React.CSSProperties}>{italic ? <em>{word}</em> : word}</span>
                </span>
              </Fragment>
            ));
          })}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </Tag>
  );
};

export default SplitText;
