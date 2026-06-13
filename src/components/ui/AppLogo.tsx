import barangayHubLogo from '../../assets/images/BarangayHub_Logo.jpg';

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className = '' }: AppLogoProps) {
  return (
    <img
      src={barangayHubLogo}
      alt="Barangay Daine II official seal"
      className={`rounded-full object-cover ${className}`}
    />
  );
}
