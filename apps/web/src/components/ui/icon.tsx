import type { LucideProps } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof LucideIcons;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" does not exist in lucide-react.`);
    return null;
  }

  return <LucideIcon {...props} />;
};
