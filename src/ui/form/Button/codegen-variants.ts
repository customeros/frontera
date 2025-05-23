import fs from 'fs';
import { format } from 'prettier';

import * as file from '../../theme/colors';

const prettierConfig = JSON.parse(
  fs.readFileSync(process.cwd() + '/.prettierrc', 'utf8'),
);

const buttonTypes = ['Link', 'Solid', 'Ghost', 'Outline'];
const sizes = ['xxs', 'xs', 'sm', 'md', 'lg'];

const colors = Object.keys(file.colors);
const variants = ['solid', 'outline', 'link', 'ghost'];

const solidButton = (color: string) => `
    ${color}: ${
  color === 'black'
    ? `[
    'text-white',
    'border',
    'border-solid',
    'bg-${color}',
    'hover:bg-${color}',
    'focus:bg-${color}',
    'border-${color}',
    'focus:shadow-ringPrimary',
    'focus-visible:shadow-ringPrimary',
    ]`
    : `[
    'text-white',
    'border',
    'border-solid',
    'bg-${color}-600',
    'hover:bg-${color}-700',
    'focus:bg-${color}-700',
    'border-${color}-600',
    'hover:border-${color}-700',
    'focus:shadow-ringPrimary',
    'focus-visible:shadow-ringPrimary',
]`
},`;

const outlineButton = (color: string) => `
    ${color}: ${
  color === 'grayModern'
    ? `[
    'text-${color}-700',
    'border',
    'border-solid',
    'border-${color}-300',
    'hover:bg-${color}-50',
    'hover:text-${color}-700',
    'focus:bg-${color}-50',
    ]`
    : `[
    'bg-${color}-50',
    'text-${color}-700',
    'border',
    'border-solid',
    'border-${color}-300',
    'hover:bg-${color}-100',
    'hover:text-${color}-700',
    'focus:bg-${color}-100',
    ]`
},`;

const ghostButton = (color: string) => `
    ${color}: ${
  color === 'grayModern'
    ? `[
      'bg-transparent',
      'shadow-none',
      'border',
      'border-solid',
      'border-transparent',
      'text-${color}-700',
      'hover:text-${color}-700',
      'focus:text-${color}-700',
      'hover:bg-${color}-100',
      'focus:bg-${color}-100',
    ]`
    : color === 'white'
    ? `[
      'bg-transparent',
      'shadow-none',
      'border',
      'border-solid',
      'border-transparent',
      'text-grayModern-25',
      'hover:text-grayModern-25',
      'focus:text-grayModern-25',
      'hover:bg-grayModern-600',
      'focus:bg-grayModern-600',
    ]`
    : `[
      'bg-transparent',
      'text-${color}-700',
      'shadow-none',
      'border',
      'border-solid',
      'border-transparent',
      'hover:text-${color}-700',
      'focus:text-${color}-700',
      'hover:bg-${color}-100',
      'focus:bg-${color}-100',
    ]`
},`;

const linkButton = (color: string) => `
    ${color}: ${
  color === 'grayModern'
    ? `[
      'text-${color}-500',
      'hover:text-${color}-700',
      'focus:text-${color}-700',
      'hover:underline',
      'focus:underline',
    ]`
    : `[
      'text-${color}-700',
      'hover:text-${color}-700',
      'focus:text-${color}-700',
      'hover:underline',
      'focus:underline',
    ]`
},`;

const buttonDefaultProp = `cva([
  'inline-flex',
  'items-center',
  'justify-center',
  'whitespace-nowrap',
  'gap-2',
  'text-base',
  'font-medium',
  'shadow-xs',
  'outline-none',
  'transition',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
],`;

const genCompoundVariant = (
  size: string,
  variant: string,
  colorScheme: string,
) => {
  let iconSize = '';

  switch (size) {
    case 'xxs':
      iconSize = 'w-3 h-3';
      break;
    case 'xs':
      iconSize = 'w-4 h-4';
      break;
    case 'sm':
      iconSize = 'w-5 h-5';
      break;
    case 'md':
      iconSize = 'w-5 h-5';
      break;
    case 'lg':
      iconSize = 'w-6 h-6';
      break;
    default:
      iconSize = 'w-4 h-4';
      break;
  }

  let iconColor = '';

  switch (variant) {
    case 'solid':
      iconColor = 'text-white';
      break;
    case 'ghost':
      iconColor = `text-${colorScheme}-700`;
      break;
    case 'link':
      iconColor = `text-${colorScheme}-700`;
      break;
    case 'outline':
      iconColor = `text-${colorScheme}-600`;
      break;
    default:
      break;
  }

  return {
    size,
    variant,
    colorScheme,
    className: [iconSize, iconColor],
  };
};

interface CompoundVariant {
  size: string;
  variant: string;
  colorScheme: string;
  className: string[];
}

function generateIconVariant(
  variants: string[],
  sizes: string[],
  colors: string[],
) {
  const compoundVariants: CompoundVariant[] = [];

  sizes.forEach((size) => {
    variants.forEach((variant) => {
      colors.forEach((colorScheme) => {
        compoundVariants.push(genCompoundVariant(size, variant, colorScheme));
      });
    });
  });

  return `const iconVariant = cva('', {
  variants: {
    size: {
      ${sizes.map((size) => `"${size}": [],`).join('\n      ')}
    },
    variant: {
      ${variants.map((variant) => `${variant}: [],`).join('\n      ')}
    },
    colorScheme: {
      ${colors.map((colorScheme) => `${colorScheme}: [],`).join('\n      ')}
    },
  },
  compoundVariants: [
    ${compoundVariants
      .map(
        (variant) =>
          `{
      size: '${variant.size}',
      variant: '${variant.variant}',
      colorScheme: '${variant.colorScheme}',
      className: ${JSON.stringify(variant.className)}
    },`,
      )
      .join('\n    ')}
  ]
});`;
}

const fileContent = `
import { cva } from 'class-variance-authority';
export ${generateIconVariant(variants, sizes, colors)}


${buttonTypes
  .flatMap(
    (buttonType) => `
  export const ${buttonType.toLowerCase()}Button = ${buttonDefaultProp} {
    variants: {
      colorScheme: {
        ${colors
          .map((color) => {
            switch (buttonType) {
              case 'Solid':
                return solidButton(color);
              case 'Outline':
                return outlineButton(color);
              case 'Ghost':
                return ghostButton(color);
              case 'Link':
                return linkButton(color);
              default:
                return '';
            }
          })
          .join('')}
      },
    },
    defaultVariants: {
      colorScheme: 'grayModern',
    },
  })

`,
  )
  .join('')}
`;

const formattedContent = format(fileContent, {
  ...prettierConfig,
  parser: 'babel',
});

const filePath = process.cwd() + '/src/ui/form/Button/Button.variants.ts';

fs.writeFile(filePath, formattedContent, () => {});
