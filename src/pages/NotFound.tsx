import { EzButton } from "@clarium/ezui-react-components";
import { Link } from "react-router-dom";

/** 404 Not Found page displayed for unmatched routes. */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg text-muted-foreground">Page not found</p>
        <Link to="/">
          <EzButton variant="text" severity="primary">
            Return to Home
          </EzButton>
        </Link>
      </div>
    </div>
  );
}
