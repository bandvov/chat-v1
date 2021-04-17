import React, { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import { Route, Switch } from "react-router";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import { ROUTES, PATH } from "../configs/routes";

const token = localStorage.getItem("token");

function Routes() {
  const [socket, setSocket] = useState(null);

  const setupSocket = useCallback(() => {
    if (token && !socket) {
      const newSocket = io(PATH, {
        query: { token },
        reconnection: true,
        transports: ["polling", "websocket"],
      });

      newSocket.on("disconnect", () => {
        setSocket(null);
      });

      setSocket(newSocket);
    }
  }, [socket]);

  useEffect(() => {
    setupSocket();
  }, [setupSocket]);

  return (
    <Switch>
      <Route
        path={ROUTES.login}
        render={() => <LoginPage socket={socket} />}
        exact
      />
      <Route
        path={ROUTES.register}
        render={() => <RegisterPage socket={socket} />}
        exact
      />
      <Route
        path={ROUTES.dashboard}
        render={() => <DashboardPage socket={socket} />}
        exact
      />
    </Switch>
  );
}

export default Routes;
