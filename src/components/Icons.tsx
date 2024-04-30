import { LucideProps, UserPlus } from "lucide-react";

export const Icons = {
  Logo: (props: LucideProps): JSX.Element => <div>Logo</div>,
  UserPlus,
};

export type Icon = keyof typeof Icons;
