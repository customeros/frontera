export const TabsContainer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className='flex min-w-[400px] flex-1 h-full bg-white flex-col border-r border-grayModern-200 overflow-hidden'>
      {children}
    </div>
  );
};
