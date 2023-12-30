import { Stack, Button } from "@mui/material";
import type { Auth } from "@/hooks/auth";

type Props = {
  id?: string;
  username?: string;
  auth?: Auth;
};

const Header = ({ auth, id, username }: Props) => {
  /**
   * ログアウト
   */
  const logout = () => {
    auth?.logout();
  };

  return (
    <header>
      <h2>ユーザー情報</h2>
      <Stack direction="row" spacing={2}>
        <div>
          <p>id: {id}</p>
        </div>
        <div>
          <p>username: {username}</p>
        </div>
        <Button onClick={logout} variant="contained" color="error">
          logout
        </Button>
      </Stack>
    </header>
  );
};

export default Header;
