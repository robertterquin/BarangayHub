import barangayHubLogo from '../../assets/images/BarangayHub_Logo.jpg';

interface AppLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function AppLogo({ className = '', style }: AppLogoProps) {
  return (
    <img
      src={barangayHubLogo}
      alt="Barangay Daine II official seal"
      style={{
        borderRadius: '50%',
        clipPath: 'circle(49.5% at 50% 50%)',
        ...style,
      }}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
