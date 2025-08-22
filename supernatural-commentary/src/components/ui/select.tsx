import React from 'react';

type SelectItemProps = React.OptionHTMLAttributes<HTMLOptionElement> & { value: string };

const ItemsContext = React.createContext<SelectItemProps[]>([]);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => {
  // Collect SelectItem children from any SelectContent subtree
  const items: SelectItemProps[] = [];
  React.Children.forEach(children as any, (child: any) => {
    if (!child) return;
    if (child.type && child.type.__isSelectContent) {
      React.Children.forEach(child.props.children, (grand: any) => {
        if (grand && grand.type && grand.type.__isSelectItem) {
          items.push({ value: grand.props.value, children: grand.props.children });
        }
      });
    }
  });

  return (
    <div className="w-full">
      <select className="w-full rounded-md border border-gray-300 p-2.5" {...props}>
        <option value="" disabled selected hidden>{/* placeholder */}</option>
        {items.map((it, idx) => (
          <option key={idx} value={it.value as string}>{it.children as any}</option>
        ))}
      </select>
      {/* Decorative structure retained */}
      {children}
    </div>
  );
};

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children }) => (
  <div>{children}</div>
);

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span className="text-gray-500">{placeholder}</span>
);

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> & { __isSelectContent?: boolean } = ({ children }) => (
  <div>{children}</div>
) as any;
(SelectContent as any).__isSelectContent = true;

export const SelectItem: React.FC<SelectItemProps> & { __isSelectItem?: boolean } = ({ children }) => (
  <option>{children as any}</option>
) as any;
(SelectItem as any).__isSelectItem = true;