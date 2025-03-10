import { Card, CardHeader, CardContent } from '@ui/presentation/Card/Card';

export const MainSection = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Card
      id='main-section'
      className='flex h-full flex-grow flex-shrink border-none rounded-none flex-col overflow-hidden shadow-none relative bg-white min-w-[609px] p-0'
    >
      <CardHeader className='px-6 pt-[6px] pb-2 flex items-center flex-row justify-between'>
        <h1 className='font-semibold text-[16px] text-grayModern-700'>
          Timeline
        </h1>
      </CardHeader>
      <CardContent className='p-0 flex flex-col flex-1'>{children}</CardContent>
    </Card>
  );
};
