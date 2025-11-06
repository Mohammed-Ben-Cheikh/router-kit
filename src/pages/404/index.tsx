import { useRouter } from "../../useRouter";
import "./styles.css";

const Page404 = () => {
  const { navigate } = useRouter();
  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-title">404</h1>
        <h2 className="error-subtitle">Page Not Found</h2>
        <p className="error-message">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => {
            navigate("/");
          }}
          className="error-button"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default Page404;
