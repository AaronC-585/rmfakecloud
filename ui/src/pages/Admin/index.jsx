import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import UserList from "./UserList";

const Home = () => {
  return (
    <Container fluid>
      <Stack gap={3}>
        <div>
          <Link to="/admin/themes">Theme studio</Link>
          <span className="text-muted"> — XML/XSLT shell themes</span>
        </div>
        <UserList />
      </Stack>
    </Container>
  );
};

export default Home;
