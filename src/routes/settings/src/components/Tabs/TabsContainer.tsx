export const TabsContainer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className='flex min-w-[400px] flex-1 h-ful bg-white flex-col border-r border-gray-200 overflow-hidden'>
      {children}
    </div>
  );
};
