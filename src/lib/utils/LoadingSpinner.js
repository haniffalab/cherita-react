import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Spinner } from "react-bootstrap";

export function LoadingSpinner({ type = "icon", text = "Loading..." }) {
  if (type === "message") {
    return (
      <div
        className="
            h-100 w-100 d-flex z-1
            bg-light opacity-75 position-absolute
            justify-content-center align-items-center
            "
      >
        <Button variant="primary" disabled>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          {text}
        </Button>
      </div>
    );
  } else {
    return (
      <div
        className="
            h-100 w-100 d-flex z-1
            bg-light opacity-75 position-absolute
            justify-content-center align-items-center
            "
      >
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">{text}</span>
        </Spinner>
      </div>
    );
  }
}
