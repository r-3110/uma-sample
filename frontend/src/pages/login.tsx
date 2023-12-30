import { useEffect } from "react";
import { Auth } from "@/hooks/auth";

const Login = () => {
  useEffect(() => {
    new Auth().init();
  }, []);

  return (
    <div>
      <h1>ログインへリダイレクトします</h1>
    </div>
  );
};

export default Login;
