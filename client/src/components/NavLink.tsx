import { Link, LinkProps } from "react-router-dom";

interface NavLinkProps extends Omit<LinkProps, "to"> {
  to: string;
  variant?: "button" | "text";
  children: React.ReactNode;
}

function NavLink({
  to,
  variant = "text",
  children,
  className = "",
  ...props
}: NavLinkProps) {
  const baseClasses = "font-medium transition-colors";

  const variantClasses = {
    button: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700",
    text: "text-blue-600 hover:text-blue-700",
  };

  const combinedClassName =
    `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <Link to={to} className={combinedClassName} {...props}>
      {children}
    </Link>
  );
}

export default NavLink;
