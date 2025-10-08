export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full">
        <button onClick={() => onOpenChange(false)} className="absolute top-2 right-2 text-black text-2xl">
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children }) => <div>{children}</div>;

export const DialogHeader = ({ children }) => (
  <div className="text-lg font-semibold text-black">{children}</div>
);

export const DialogTitle = ({ children }) => <h3>{children}</h3>;
