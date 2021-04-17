import React, { useEffect, useRef, useState } from "react";
import { Card } from "antd";
import Avatar from "antd/lib/avatar/avatar";
import Meta from "antd/lib/card/Meta";

const Message = ({ message, userId, key, top }) => {
  const ref = useRef();
  const isRead =
    (ref?.current?.offsetTop > top && ref?.current?.offsetTop < top + 130 * 3) ||
    false;
  const handler = () => {
    console.log("top", "mes");
    console.log(top, ref.current.offsetTop);
  };

  return (
    <div
      onMouseMove={handler}
      ref={ref}
      key={key}
      style={{
        display: "flex",
        alignItems: "center",
        marginLeft: "1rem",
      }}
    >
      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      <Card
        style={{
          margin: 16,
          border: "1px solid blue",
          borderRadius: "15px 16px 15px 0",
          backgroundColor: message.user === userId ? "" : "lightblue",
        }}
      >
        <Meta description={message.text} />
      </Card>
      {"viewed:" + isRead}
    </div>
  );
};

export default Message;
