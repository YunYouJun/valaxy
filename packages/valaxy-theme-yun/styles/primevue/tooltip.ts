export default {
  root: ({ context }: {
    context: {
      right?: boolean
      left?: boolean
      top?: boolean
      bottom?: boolean
    }
  }) => ({
    class: [
      // Position and Shadows
      'absolute',
      'p-fadein',
      // Spacing
      (context?.right || context?.left || (!context?.right && !context?.left && !context?.top && !context?.bottom)) && '[&[data-p-position="top"]]:py-1 [&[data-p-position="top"]]:px-0 py-0 px-1',
      (context?.top || context?.bottom) && 'py-1 px-0',

      // Flipped Tooltip Arrow
      '[&[data-p-position="top"]>[data-pc-section=arrow]]:border-x-[10px] [&[data-p-position="top"]>[data-pc-section=arrow]]:border-t-[10px] [&[data-p-position="top"]>[data-pc-section=arrow]]:border-b-0 [&[data-p-position="top"]>[data-pc-section=arrow]]:border-t-surface-700 [&[data-p-position="top"]>[data-pc-section=arrow]]:border-y-0 [&[data-p-position="top"]>[data-pc-section=arrow]]:border-x-transparent',

      '[&[data-p-position="top"]>[data-pc-section=arrow]]:-ml-[10px] [&[data-p-position="top"]>[data-pc-section=arrow]]:left-1/2 [&[data-p-position="top"]>[data-pc-section=arrow]]:mt-auto [&[data-p-position="top"]>[data-pc-section=arrow]]:top-auto',
    ],
  }),
  arrow: ({ context }: {
    context: {
      right?: boolean
      left?: boolean
      top?: boolean
      bottom?: boolean
    }
  }) => ({
    class: [
      // Position
      'absolute',

      // Size
      'w-0',
      'h-0',

      // Shape
      'border-transparent',
      'border-solid',
      {
        'border-y-[10px] border-r-[10px] border-l-0 border-r-surface-700': context?.right || (!context?.right && !context?.left && !context?.top && !context?.bottom),
        'border-y-[10px] border-l-[10px] border-r-0 border-l-surface-700': context?.left,
        'border-x-[10px] border-t-[10px] border-b-0 border-t-surface-700 ': context?.top,
        'border-x-[10px] border-b-[10px] border-t-0 border-b-surface-700': context?.bottom,
      },

      // Spacing
      {
        '-mt-[10px] top-1/2': context?.right || context?.left || (!context?.right && !context?.left && !context?.top && !context?.bottom),
        '-ml-[10px] left-1/2': context?.top || context?.bottom,
      },
    ],
  }),
  text: {
    class: ['p-3', 'bg-surface-700', 'text-white', 'leading-none', 'rounded-md', 'whitespace-pre-line', 'break-words', 'shadow-md'],
  },
}
