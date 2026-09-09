import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { useAuthState } from "../../common/useAuthContext";

import ResetPassword from "./ResetPassword";
import Passkeys from "./Passkeys";
import ThemePicker from "./ThemePicker";

const Home = () => {
  const { state: { user } } = useAuthState();
  return (
    <Container fluid style={{ overflow: "auto", height: "100%" }}>
      <Stack gap={4} className="py-3">
        <div>
          {user.scopes === "sync15" && (<span>Using sync 15</span>)}
        </div>
        <ThemePicker />
        <Passkeys />
        <ResetPassword />
      </Stack>
    </Container>
  );
};

export default Home;
