import appLogo from '@/images/appLogo.jpg';
export default function ApplicationLogo(props) {
    return (
        <img
        src={appLogo}
        alt="App Logo"
        className={props.className || "h-20 w-auto"}
      />
    );
}
