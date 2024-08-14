export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center  w-full">
      <div className="w-4/5 max-w-screen-xl">
        {children}
      </div>
    </section>
  );
}