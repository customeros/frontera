import Markdown from 'react-markdown';
import { Children, isValidElement } from 'react';

import { cn } from '@ui/utils/cn';

export const MarkdownRenderer = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  return (
    <Markdown
      className={cn(
        'text-sm',
        '[&>ul]:list-disc [&>ul>li>ul]:list-circle [&>ul>li>ul>li>ul]:list-square',
        '[&>ol]:list-decimal [&>ol>li>ol]:list-[lower-alpha] [&>ol>li>ol>li>ol]:list-[lower-roman]',
        '[&>ul>li>ol]:list-decimal [&>ul>li>ol>li>ol]:list-[lower-alpha] [&>ul>li>ol>li>ol>li>ol]:list-[lower-roman]',
        '[&>ol]:pl-4 [&_ol]:pl-4 [&>ul]:pl-4 [&_ul]:pl-4',
        className,
      )}
      components={{
        blockquote: ({ children }) => (
          <blockquote className='text-grayModern-500 border-l border-grayModern-500 pl-3'>
            {children}
          </blockquote>
        ),

        ul: ({ children }) => <ul className='my-1'>{children}</ul>,

        li: ({ children }) => {
          const renderContent = () => {
            return Children.map(children, (child, index) => {
              if (isValidElement(child) && child.props?.node?.type === 'list') {
                return (
                  <div key={index} className='mt-1'>
                    {child}
                  </div>
                );
              }

              return child;
            });
          };

          return <li className='my-1'>{renderContent()}</li>;
        },

        ol: ({ children }) => <ol className='my-1'>{children}</ol>,

        h1: ({ children }) => <h1 className='text-sm font-bold'>{children}</h1>,

        h2: ({ children }) => (
          <h2 className='text-sm font-medium'>{children}</h2>
        ),

        p: ({ children }) => <p className='text-sm'>{children}</p>,

        a: ({ children, href }) => (
          <a
            href={href}
            target='_blank'
            rel='noreferrer noopener'
            className='text-blue-500 hover:underline'
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </Markdown>
  );
};
